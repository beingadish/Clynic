/**
 * Represents an AWS CDK stack for local development using LocalStack.
 *<p>
 * This stack provisions the following resources within a VPC:
 * <ul>
 *   <li>RDS PostgreSQL database instances for authentication and core services</li>
 *   <li>Managed Kafka (MSK) single-node cluster</li>
 *   <li>ECS Fargate cluster and multiple service definitions (Auth, Billing, Analytics, Core)</li>
 *   <li>API Gateway service running on Fargate</li>
 *</ul>
 *<p>
 * Dependencies between services and health checks are configured to ensure proper startup order.
 */
package com.beingadish.projects.stack;

import software.amazon.awscdk.*;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.ecs.*;
import software.amazon.awscdk.services.ecs.Protocol;
import software.amazon.awscdk.services.ecs.patterns.ApplicationLoadBalancedFargateService;
import software.amazon.awscdk.services.logs.LogGroup;
import software.amazon.awscdk.services.logs.RetentionDays;
import software.amazon.awscdk.services.msk.CfnCluster;
import software.amazon.awscdk.services.rds.*;
import software.amazon.awscdk.services.route53.CfnHealthCheck;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Localstack extends Stack {

    /** The VPC where all resources will be deployed. */
    private final Vpc vpc;

    /** The ECS cluster for Fargate services. */
    private final Cluster ecsCluster;

    /**
     * Creates a PostgreSQL RDS database instance within the stack.
     *
     * @param id     Logical identifier for the database construct
     * @param dbName Name of the database to create
     * @return A {@link DatabaseInstance} representing the provisioned RDS instance
     */
    private DatabaseInstance createDatabase(String id, String dbName) {
        return DatabaseInstance.Builder
                .create(this, id)
                .engine(DatabaseInstanceEngine.postgres(
                        PostgresInstanceEngineProps.builder()
                                .version(PostgresEngineVersion.VER_16_2)
                                .build()))
                .vpc(vpc)
                .instanceType(InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.MICRO))
                .allocatedStorage(20)
                .credentials(Credentials.fromGeneratedSecret("admin_user"))
                .databaseName(dbName)
                .removalPolicy(RemovalPolicy.DESTROY)
                .build();
    }

    /**
     * Provisions an AWS Managed Streaming for Apache Kafka (MSK) cluster.
     *
     * @return A {@link CfnCluster} representing the MSK cluster
     */
    private CfnCluster createMskCluster() {
        return CfnCluster.Builder
                .create(this, "MskCluster")
                .clusterName("kafka-cluster")
                .kafkaVersion("2.8.0")
                .numberOfBrokerNodes(1)
                .brokerNodeGroupInfo(CfnCluster.BrokerNodeGroupInfoProperty.builder()
                        .instanceType("kafka.m5.xlarge")
                        .clientSubnets(vpc.getPrivateSubnets().stream()
                                .map(ISubnet::getSubnetId)
                                .collect(Collectors.toList()))
                        .brokerAzDistribution("DEFAULT")
                        .build())
                .build();
    }

    /**
     * Constructs the Localstack stack, wiring all resources together.
     *
     * @param scope The CDK app to which this stack belongs
     * @param id    Logical identifier for the stack
     * @param props Stack properties (e.g., environment, synthesizer)
     */
    public Localstack(final App scope, final String id, final StackProps props) {
        super(scope, id, props);
        this.vpc = createVpc();

        DatabaseInstance clynicAuthServiceDB = createDatabase("ClynicAuthServiceDB", "clynic-auth-service-db");
        DatabaseInstance clynicServiceDB = createDatabase("ClynicServiceDB", "clynic-service-db");

        CfnHealthCheck clynicAuthServiceDBHealthCheck = createDBHealthCheck(clynicAuthServiceDB, "ClynicAuthServiceDBHealthCheck");
        CfnHealthCheck clynicServiceDBHealthCheck = createDBHealthCheck(clynicServiceDB, "ClynicServiceDBHealthCheck");

        CfnCluster mskCluster = createMskCluster();

        this.ecsCluster = createECSCluster();

        FargateService authService = createFargateService(
                "ClynicAuthService",
                "clynic-auth-service",
                List.of(4005),
                clynicAuthServiceDB,
                Map.of("JWT_SECRET","b82991438eaca31a7d19359b3a5295f69353404493e6555e438cd20036b4beab79c7406ea1853e368ffd0315db77603603ed08a2d86d196d4228f4b0267aae70ebf568a54df9f54fc48181a4559ab159ebca318258ad595f2802dff038801f6dd7208a63699d961fe1aac3f8bebf47c37b27374c524b7d14d65a4f50e35be3e27decfdcfa8176333a4959994ccfb89a01bb210939c73152dbdb6902cc596b0e285db4b962b8fcdf44d2b6f2c565e8290c9cedce16a2cc086def81e25b890edd844ec884478a2522038b55a2ed64e07cec5a065518880196e6f5ab4fc8ab14eb5121a816fe04e6378b8f07b54014188eca924d158d7606ad11380d424a067244e38d047ae5471d5f58faa8d52622a7bdbab8655e47fc8d6a756046440123cf087308c0ab01b44cea619cd0c292b53c9e14f86e7d04b088adea3c17ad2346e8c51ed609c3a2749be8a3ee450ac682ab3c5ebcb5555d86b0d2ff749f1aca5f8953b1bd1157a549079e9fae525de128ca104c50a083cf7a147549964be4234ea61b10aca24da36a082252091f85c335b497f0df6cae95b3d44901ac1a9c437710fcf244b0c3af336c163030b2591fea0bdf4b1107a98cc39e7349104ff196a3ab12f42ffb52b766561107ed5c6da22f8b2a926e446c7125e590901fb54c49da05f2c25bfa6888cdceb8d76485cf31ad538ce7cefd8d8da9b6062947361728e5ddd97")
        );

        authService.getNode().addDependency(clynicAuthServiceDBHealthCheck);
        authService.getNode().addDependency(clynicAuthServiceDB);

        FargateService billingService = createFargateService(
                "ClynicBillingService", "clynic-billing-service",
                List.of(4001, 9001), null, null
        );

        FargateService analyticsService = createFargateService(
                "ClynicAnalyticsService", "clynic-analytics-service",
                List.of(4002), null, null
        );

        analyticsService.getNode().addDependency(mskCluster);

        FargateService clynicService = createFargateService(
                "ClynicService", "clynic-service",
                List.of(4000), clynicServiceDB,
                Map.of(
                        "BILLING_SERVICE_ADDRESS", "host.docker.internal",
                        "BILLING_SERVICE_GRPC_PORT", "9001"
                )
        );
        clynicService.getNode().addDependency(clynicServiceDBHealthCheck);
        clynicService.getNode().addDependency(clynicServiceDB);
        clynicService.getNode().addDependency(billingService);
        clynicService.getNode().addDependency(mskCluster);

        createApiGatewayService();
    }

    /**
     * Creates a VPC spanning multiple Availability Zones.
     *
     * @return A {@link Vpc} with default subnets across two AZs
     */
    private Vpc createVpc() {
        return Vpc.Builder
                .create(this, "ClynicVPC")
                .vpcName("ClynicVPC")
                .maxAzs(2)
                .build();
    }

    /**
     * Creates an ECS cluster with a CloudMap namespace for service discovery.
     *
     * @return A {@link Cluster} configured for Fargate services
     */
    private Cluster createECSCluster() {
        return Cluster.Builder
                .create(this, "ClynicServiceCluster")
                .vpc(vpc)
                .defaultCloudMapNamespace(CloudMapNamespaceOptions.builder()
                        .name("clynic-service.local")
                        .build())
                .build();
    }

    /**
     * Configures a Route53 health check for an RDS instance endpoint.
     *
     * @param dbInstance The database instance to monitor
     * @param id         Logical identifier for the health check
     * @return A {@link CfnHealthCheck} for TCP connectivity checks
     */
    private CfnHealthCheck createDBHealthCheck(DatabaseInstance dbInstance, String id) {
        return CfnHealthCheck.Builder
                .create(this, id)
                .healthCheckConfig(CfnHealthCheck.HealthCheckConfigProperty.builder()
                        .type("TCP")
                        .port(Token.asNumber(dbInstance.getDbInstanceEndpointPort()))
                        .ipAddress(dbInstance.getDbInstanceEndpointAddress())
                        .requestInterval(30)
                        .failureThreshold(3)
                        .build())
                .build();
    }

    /**
     * Provisions an AWS Fargate service with a single container.
     *<p>
     * Adds default and additional environment variables, port mappings, and logging configuration.
     *
     * @param id                Logical ID for the service
     * @param imageName         Docker image name in registry
     * @param ports             List of container ports to expose
     * @param db                Optional RDS instance for Spring Data integration
     * @param additionalEnvVars Additional environment variables
     * @return A {@link FargateService} representing the running service
     */
    private FargateService createFargateService(
            String id,
            String imageName,
            List<Integer> ports,
            DatabaseInstance db,
            Map<String, String> additionalEnvVars
    ) {
        FargateTaskDefinition taskDefinition = FargateTaskDefinition.Builder
                .create(this, id + "Task")
                .cpu(256)
                .memoryLimitMiB(512)
                .build();

        ContainerDefinitionOptions.Builder containerOptions = ContainerDefinitionOptions
                .builder()
                .image(ContainerImage.fromRegistry(imageName))
                .environment(additionalEnvVars)
                .portMappings(ports.stream()
                        .map(port -> PortMapping.builder()
                                .containerPort(port)
                                .hostPort(port)
                                .protocol(Protocol.TCP)
                                .build())
                        .toList())
                .logging(LogDriver.awsLogs(AwsLogDriverProps.builder()
                        .logGroup(LogGroup.Builder.create(this,id+"LogGroup")
                                .logGroupName("/ecs/"+imageName)
                                .removalPolicy(RemovalPolicy.DESTROY)
                                .retention(RetentionDays.ONE_DAY)
                                .build())
                        .streamPrefix(imageName)
                        .build()));

        Map<String, String> containerEnvVars = new HashMap<>();
        containerEnvVars.put("SPRING_KAFKA_BOOTSTRAP_SERVERS",
                "localhost.localstack.cloud:4510, localhost.localstack.cloud:4511, localhost.localstack.cloud:4512");

        if (additionalEnvVars != null) {
            containerEnvVars.putAll(additionalEnvVars);
        }

        if (db != null) {
            containerEnvVars.put(
                    "SPRING_DATASOURCE_URL",
                    String.format("jdbc:postgres://%s:%s/%s-db",
                            db.getDbInstanceEndpointAddress(),
                            db.getDbInstanceEndpointPort(), imageName)
            );
            containerEnvVars.put("SPRING_DATASOURCE_USERNAME", "admin_user");
            containerEnvVars.put("SPRING_DATASOURCE_PASSWORD",
                    db.getSecret().secretValueFromJson("password").toString());
            containerEnvVars.put("SPRING_JPA_HIBERNATE_DDL_AUTO", "update");
            containerEnvVars.put("SPRING_SQL_INIT_MODE", "always");
            containerEnvVars.put(
                    "SPRING_DATASOURCE_HIKARI_INITIALIZATION_FAIL_TIMEOUT",
                    "60000"
            );
        }

        containerOptions.environment(containerEnvVars);
        taskDefinition.addContainer(imageName + "Container", containerOptions.build());

        return FargateService.Builder
                .create(this, id)
                .cluster(ecsCluster)
                .taskDefinition(taskDefinition)
                .assignPublicIp(false)
                .serviceName(imageName)
                .build();
    }

    /**
     * Creates an API Gateway service running on Fargate with an ALB.
     */
    private void createApiGatewayService() {
        FargateTaskDefinition taskDefinition = FargateTaskDefinition.Builder
                .create(this, "APIGatewayTaskDefinition")
                .cpu(256)
                .memoryLimitMiB(512)
                .build();

        ContainerDefinitionOptions containerOptions = ContainerDefinitionOptions
                .builder()
                .image(ContainerImage.fromRegistry("api-gateway"))
                .environment(Map.of(
                        "SPRING_PROFILES_ACTIVE", "prod",
                        "AUTH_SERVICE_URL", "http://host.docker.internal:4005"
                ))
                .portMappings(List.of(4004).stream()
                        .map(port -> PortMapping.builder()
                                .containerPort(port)
                                .hostPort(port)
                                .protocol(Protocol.TCP)
                                .build())
                        .toList())
                .logging(LogDriver.awsLogs(AwsLogDriverProps.builder()
                        .logGroup(LogGroup.Builder.create(this,"APIGatewayLogGroup")
                                .logGroupName("/ecs/api-gateway")
                                .removalPolicy(RemovalPolicy.DESTROY)
                                .retention(RetentionDays.ONE_DAY)
                                .build())
                        .streamPrefix("api-gateway")
                        .build()))
                .build();

        taskDefinition.addContainer("APIGatewayContainer", containerOptions);

        ApplicationLoadBalancedFargateService.Builder
                .create(this, "APIGatewayService")
                .cluster(ecsCluster)
                .serviceName("api-gateway")
                .taskDefinition(taskDefinition)
                .desiredCount(1)
                .healthCheckGracePeriod(Duration.seconds(60))
                .build();
    }

    /**
     * Entry point for the CDK application. Synthesizes the stack.
     *
     * @param args CLI arguments (unused)
     */
    public static void main(final String[] args) {
        App app = new App(AppProps.builder().outdir("./cdk.out").build());
        StackProps stackProps = StackProps.builder()
                .synthesizer(new BootstraplessSynthesizer())
                .build();

        new Localstack(app, "localstack", stackProps);
        app.synth();
        System.out.println("App Synthesizing in process...");
    }
}
