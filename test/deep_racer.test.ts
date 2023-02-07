import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as DeepRacer from '../lib/deep_racer-stack';
import cdkContext from '../cdk.context.json';

// TODO: Fix context
//
// example test. To run these tests, uncomment this file along with the
// example resource in lib/deep_racer-stack.ts
test('Context used:', () => {
  const app = new cdk.App({
    context: cdkContext,
  });
    // WHEN
  const stack = new DeepRacer.DeepRacerStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SageMaker::NotebookInstance', {
    InstanceType: cdkContext.instanceType
  });

  template.hasResourceProperties('AWS::EC2::SecurityGroup', Match.objectLike({
    SecurityGroupEgress: [{ CidrIp: cdkContext.vpcCidr }, { CidrIp: cdkContext.vpcCidr }],
    SecurityGroupIngress: [{ CidrIp: cdkContext.vpcCidr }, { CidrIp: cdkContext.vpcCidr }]
  }));
});
