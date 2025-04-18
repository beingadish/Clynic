package com.beingadish.projects.stack;

import software.amazon.awscdk.*;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.ecs.*;
import software.amazon.awscdk.services.ecs.Protocol;
import software.amazon.awscdk.services.logs.LogGroup;
import software.amazon.awscdk.services.logs.RetentionDays;
import software.amazon.awscdk.services.msk.CfnCluster;
import software.amazon.awscdk.services.rds.*;
import software.amazon.awscdk.services.route53.CfnHealthCheck;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Localstack extends Stack {

    private final Vpc vpc;

    private final Cluster ecsCluster;

    // Database Instance
    private DatabaseInstance createDatabase(String id, String dbName){
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

    // Kafka Cluster using MSK (Managed Kafka Service)
    private CfnCluster createMskCluster(){
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

    public Localstack(final App scope, final String id, final StackProps props){
        super(scope, id, props);
        this.vpc = createVpc();

        DatabaseInstance clynicAuthServiceDB = createDatabase("ClynicAuthServiceDB", "clynic-auth-service-db");
        DatabaseInstance clynicServiceDB = createDatabase("ClynicServiceDB", "clynic-service-db");

        CfnHealthCheck clynicAuthServiceDBHealthCheck = createDBHealthCheck(clynicAuthServiceDB, "ClynicAuthServiceDBHealthCheck");
        CfnHealthCheck clynicServiceDBHealthCheck = createDBHealthCheck(clynicServiceDB, "ClynicServiceDBHealthCheck");

        CfnCluster mskCluster = createMskCluster();

        this.ecsCluster = createECSCluster();

    }


    // VPC (Virtual Private Cloud)
    private Vpc createVpc() {
        return Vpc.Builder
                .create(this, "ClynicVPC")
                .vpcName("ClynicVPC")
                .maxAzs(2)
                .build();
    }

    // ECS Cluster
    private Cluster createECSCluster() {
        return Cluster.Builder
                .create(this, "ClynicServiceCluster")
                .vpc(vpc)
                .defaultCloudMapNamespace(CloudMapNamespaceOptions.builder()
                        .name("clynic-service.local")
                        .build())
                .build();
    }

    // DB Health Check
    private CfnHealthCheck createDBHealthCheck(DatabaseInstance dbInstance, String id){
        return CfnHealthCheck.Builder
                .create(this,id)
                .healthCheckConfig(CfnHealthCheck.HealthCheckConfigProperty.builder()
                        .type("TCP")
                        .port(Token.asNumber(dbInstance.getDbInstanceEndpointPort()))
                        .ipAddress(dbInstance.getDbInstanceEndpointAddress())
                        .requestInterval(30)
                        .failureThreshold(3)
                        .build())
                .build();
    }

    private FargateService createFargateService(String id, String imageName, List<Integer> ports, DatabaseInstance db, Map<String, String> additionalEnvVars) {

        FargateTaskDefinition taskDefinition = FargateTaskDefinition.Builder
                .create(this, id + "Task")
                .cpu(256)
                .memoryLimitMiB(512)
                .build();

        ContainerDefinitionOptions containerOptions = ContainerDefinitionOptions
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
                        .build()))
                .build();

        return FargateService.Builder
                .create(this,id)
                .build();
    }

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
