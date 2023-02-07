# Deep Racer Environment Configuration for Training and Log Analysis using CDK

## Overview

AWS DeepRacer is a simple and fun way to get started with reinforcement learning (RL), an ML technique where an agent, discovers the optimal actions to take in a given environment. In our case, that would be AWS DeepRacer vehicle, trying to get fast around a track! You can get started with RL quickly with hands-on tutorials that guide you through the basics of training RL models and testing them in an exciting, autonomous car racing experience. 

In this repository, we’ll be enabling the provisioning of different components required for performing log analysis using SageMaker on DeepRacer via CDK constructs. 

The analysis graph provided within in the DeepRacer console, however effective and straight forward between the rewards granted and progress achieved, it does not give insight into how fast the car moves through the waypoints, or what kind of a line the car prefers around the track, and this is where the advanced log analysis comes into play. Our advanced log analysis aims to bring efficiency in training retrospectively to understand which reward functions and action spaces work better than the others when training multiple models, and whether a model is overfitting; so that racers can train smarter and achieve better results with less training.


## Prerequisites

In order to provision ML environments with the AWS CDK, kindly ensure:
* Have access to the AWS account and permissions within the region to deploy the necessary resources for different personas. Make sure you have the credentials and permissions to deploy the AWS CDK stack into your account.

    * We recommend following certain best practices that are highlighted through the concepts detailed in the following resources:  
    * Building secure machine learning environments with Amazon SageMaker
    * Setting up secure, well-governed machine learning environments on AWS


## Walkthrough

FThe solution describes DeepRacer environment configuration using CDK to accelerate the journey of users experimenting with SageMaker Log analysis and Reinforcement learning on AWS for DeepRacer event, while leveraging the capabilities of CDK.  

In this solution, the user will login to the AWS console, the administrator can run the CDK script provided in GitHub described below or in the terminal after loading the code in their environment:

1. Open Cloud9 in AWS Console
2. Load the CDK module from GitHub into Cloud9 environment 
3. Configure the CDK module as described below
4. Open cdk.context.json file and inspect all the parameters 
5. Modify the parameters as needed and run the CDK command with the intended persona to launch the configured environment suited for that persona


### Generating diagrams using cdk-dia
- Prerequisite: Install graphviz using your operating system tools
```
npm -g cdk-dia

This would install the cdk-dia application. Now run
cdk-dia
```

A graphical representation of your CDK stack will be stored in png format.

Additional details on Log Analysis using DeepRacer and associated visualizations can be found [here](https://aws.amazon.com/blogs/machine-learning/using-log-analysis-to-drive-experiments-and-win-the-aws-deepracer-f1-proam-race/).


## Clean-up

To avoid ongoing charges:
- Use cdk destroy in order to delete the resources created via cdk
- Make sure to check into CloudFormation console to ensure the stack has been deleted in sometime. 

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
