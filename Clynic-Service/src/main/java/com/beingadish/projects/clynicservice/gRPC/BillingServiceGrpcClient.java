package com.beingadish.projects.clynicservice.gRPC;

import billing.BillingRequest;
import billing.BillingResponse;
import billing.BillingServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BillingServiceGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceGrpcClient.class);
    private final BillingServiceGrpc.BillingServiceBlockingStub blockingStub;


    // localhost:9001/BillingService/CreatePatientAccount
    // aws.grpc:12321/BillingService/CreatePatientService --> for AWS
    public BillingServiceGrpcClient(@Value("${billing.service.address:localhost}") String serverAddress,
                                    @Value("${billing.service.grpc.port:9001}") int serverPort) {

        // Our Debug Logger
        log.info("Connecting to Billing Service GRPC Service at {}:{}", serverAddress, serverPort);

        // Creating a Managed Channel for Communication
        // Disables the Encryption -> Easier Local Development/Testing
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort).usePlaintext().build();


        blockingStub = BillingServiceGrpc.newBlockingStub(channel);
    }

    public BillingResponse createBillingAccount(String patientId, String name, String email){
        BillingRequest request = BillingRequest.newBuilder()
                .setPatientId(patientId)
                .setName(name)
                .setEmail(email)
                .build();

        // Calling the gRPC Request using BlockingStub to get the response
        BillingResponse response = blockingStub.createBillingAccount(request);
        log.info("Created Billing Account from gRPC: {}", response);
        return response;
    }
}
