package com.beingadish.projects.stack;

import software.amazon.awscdk.*;

public class Localstack extends Stack {


    public Localstack(final App scope, final String id, final StackProps props){
        super(scope, id, props);
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
