import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Effect, PolicyStatement, StarPrincipal } from 'aws-cdk-lib/aws-iam';
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';


export class DeepRacerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
  // const BucketName = new cdk.CfnParameter(this, "BucketName", {
  //       type: "String",
  //       description: "Create and use a bucket created via this template for model storage."});
  
  // const s3Bucket = new s3.Bucket(this, 'SandBoxBucket', {
  //     //objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
  //     blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  //     bucketName: `${this.node.tryGetContext("bucketName")}${this.account}`,
  //     //encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
  //     encryption: BucketEncryption.S3_MANAGED,
  //     removalPolicy: RemovalPolicy.DESTROY,
  //   });

  //   // s3Bucket.grantRead(new iam.AccountRootPrincipal());
  // s3Bucket.addToResourcePolicy(new PolicyStatement({
  //   effect: Effect.DENY,
  //   actions: ['s3:*'],
  //   principals: [new StarPrincipal()],
  //   resources: [s3Bucket.bucketArn, `${s3Bucket.bucketArn}/*`],
  //   conditions: {
  //     "Bool": { "aws:SecureTransport": false }
  //   }
  // }));  
  
    
  const vpcCidr = process.env.VPC_CIDR;  
  const vpc = new ec2.Vpc(this, 'DeepRacer Sandbox', {
      cidr: this.node.tryGetContext('vpcCidr'),
      // natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'Deepracer Sandbox - Public Subnet - A',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Deepracer Sandbox - Public Subnet - B',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Deepracer Sandbox - Public Subnet - C',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Deepracer Sandbox - Public Subnet - D',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        }
      ]
    });
    vpc.addFlowLog('DeepRacerSagemakerSetup').applyRemovalPolicy(RemovalPolicy.DESTROY);
    
    /**
     * Disable outbound access on default security group
     */
    const egressParameters = {
      GroupId: vpc.vpcDefaultSecurityGroup,
      IpPermissions: [
          {
              IpProtocol: '-1',
              IpRanges: [
                  {
                      CidrIp: '0.0.0.0/0',
                  },
              ],
          },
      ],
  };

  new AwsCustomResource(
      this,
      'RestrictSecurityGroupEgress',
      {
          onCreate: {
              service: 'EC2',
              action: 'revokeSecurityGroupEgress',
              parameters: egressParameters,
              physicalResourceId: PhysicalResourceId.of(`restrict-egress-${vpc.vpcId}-${vpc.vpcDefaultSecurityGroup}`),
          },
          onDelete: {
              service: 'EC2',
              action: 'authorizeSecurityGroupEgress',
              parameters: egressParameters,
          },
          policy: AwsCustomResourcePolicy.fromSdkCalls({
              resources: [`arn:aws:ec2:${this.region}:${this.account}:security-group/${vpc.vpcDefaultSecurityGroup}`],
          }),
      });
   
  // Security Group for sagemaker instance running in this VPC
  const SagemakerInstanceSecurityGroup = new ec2.SecurityGroup(this, 'SagemakerInstanceSecurityGroup', {
      vpc,
      allowAllOutbound: false,
      description: 'Sagemaker Security Group',
    });
  
  SagemakerInstanceSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.96.0.0/16'),
      ec2.Port.tcpRange(1,65535),
    );

    SagemakerInstanceSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.96.0.0/16'),
      ec2.Port.udpRange(1,65535),
    );

    SagemakerInstanceSecurityGroup.addEgressRule(
      ec2.Peer.ipv4('10.96.0.0/16'),
      ec2.Port.tcpRange(1,65535),
    );
    
    SagemakerInstanceSecurityGroup.addEgressRule(
      ec2.Peer.ipv4('10.96.0.0/16'),
      ec2.Port.udpRange(1,65535),
    );
    
    
  // Define a S3 endpoint for all the S3 traffic during training
  // const S3Endpoint = new ec2.GatewayVpcEndpoint(this, 'S3Endpoint', {
  //       service:  ec2.GatewayVpcEndpointAwsService.S3,
  //       vpc,
  //   });
    
  // const allowAccessToS3 = new iam.PolicyStatement({
  //     actions: ['s3:*'],
  //     effect: iam.Effect.ALLOW,
  //     principals: [new iam.AnyPrincipal()],
  //     resources: ['*'],
  //   });
  //   // attach the policy statement to the vpce
  //   S3Endpoint.addToPolicy(allowAccessToS3);
  
    
  
  // Create DeepRacer Policy 
    // const DeepRacerPolicy = new iam.PolicyDocument({
    //   statements: [
    //     new iam.PolicyStatement({
    //       resources: ['*'],
    //       actions: ['s3:*',
    //                 'iam:GetRole'
    //                 ],
    //     }),
    //   ],
    // });

  // Sagemaker is going to be making calls to Robomaker to launch the sim, and Sagemaker to launch the training insance. 
  // This requries AWS credentals. A Principal of sagemaker and robomaker needs to be assiged as both service will assuming this role. Default Sagemaker full access and s3 access is needed.
    // Create Role
    const SageMakerNotebookInstanceRole = new iam.Role(this, 'SageMakerNotebookInstanceRole', {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
      description: 'SageMaker Notebook instance IAM role in AWS CDK',
       managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSageMakerFullAccess',
            ),
          ],
        });
      
      SageMakerNotebookInstanceRole.attachInlinePolicy(
        new iam.Policy(this, "DeepRacerPolicy", {
          statements: [
            new iam.PolicyStatement({
          resources: ['*'],
          actions: [
                    'iam:GetRole',
                    'deepracer:ListModels',
                    'deepracer:ListTrainingJobs',
                    'deepracer:GetAssetUrl'
                  ],
                  }),
                ],
              }),
            );

      // s3Bucket.grantReadWrite(SageMakerNotebookInstanceRole);
      
      SageMakerNotebookInstanceRole.assumeRolePolicy?.addStatements(
        new iam.PolicyStatement({
          actions: ['sts:AssumeRole'],
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal('robomaker.amazonaws.com')],
       }),
      );
  
  // This is how the notebook gets loaded on to sagemaker. There is a zip file with
  // with the needed files, and a second http call to pull down the notebook.
  // This is only done "OnCreate" - when the sagemaker instance is first deployed
  // You can can the script get run "OnStart" (when a sagemaker instance changes
  // from a stopped state to a running state). This would automaticlly update file
  // to be the latest form source, but could over write changes applied during
  // your testing
  
  const SageMakerNotebookInstanceLifecycleConfig = new sagemaker.CfnNotebookInstanceLifecycleConfig(this, 'NotebookLifecycleConfig', /* all optional props */ {
        notebookInstanceLifecycleConfigName: 'NotebookLifecycleConfig',
        onCreate: [{
          content: cdk.Fn.base64('#!/bin/bash \ncd /home/ec2-user/SageMaker\nnohup curl -OL https://github.com/aws-deepracer/aws-deepracer-workshops/archive/refs/heads/master.zip\nnohup unzip master.zip\nnohup chown ec2-user:ec2-user -R /home/ec2-user/SageMaker'),
          }],
        });
  
     
  // Creating the Sagemaker Notebook Instance
  const cfnNotebookInstance = new sagemaker.CfnNotebookInstance(this, 'DeepRacerSagemakerSandbox', {
    instanceType: this.node.tryGetContext('instanceType'),
    roleArn: SageMakerNotebookInstanceRole.roleArn,
    lifecycleConfigName: SageMakerNotebookInstanceLifecycleConfig.attrNotebookInstanceLifecycleConfigName,
    notebookInstanceName: 'DeepRacerSagemakerSandbox',
    securityGroupIds: [SagemakerInstanceSecurityGroup.securityGroupId],
    subnetId: vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC}).subnetIds[0],
    tags: [{
      key: 'Name',
      value: 'DeepRacer Sandbox',
    }],
    //volumeSizeInGb: 123,
  });

  cfnNotebookInstance.applyRemovalPolicy(RemovalPolicy.DESTROY);

  
  
  }
}
