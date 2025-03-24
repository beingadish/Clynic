package com.beingadish.projects.billingservice.gRPC;

import billing.BillingRequest;
import billing.BillingResponse;
import billing.BillingServiceGrpc.BillingServiceImplBase;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@GrpcService
public class BillingGrpcService extends BillingServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(BillingGrpcService.class);

    @Override
    // Stream Observer (concept of gRPC) --> lets us Return Multiple Responses to Client & Let us do back & forth communication
    public void createBillingAccount(BillingRequest billingRequest, StreamObserver<BillingResponse> responseObserver){
        log.info("createBillingAccount request received: {}", billingRequest.toString());

        // Business Logic -> e.g. Save to DB,Perform Calculations, etc

        BillingResponse billingResponse = BillingResponse.newBuilder()
                .setAccountId("12345")
                .setStatus("ACTIVE")
                .build();

        // Used to send response to client (PatientService) from our BillingService
        responseObserver.onNext(billingResponse);

        // Response is Completed (End Cycle)
        responseObserver.onCompleted();
    }
}
