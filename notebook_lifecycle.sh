#!/bin/bash \
cd /home/ec2-user/SageMaker \
curl -O https://us-west-2-aws-training.s3.amazonaws.com/awsu-spl-dev/spl-227/scripts/rl_deepracer_robomaker_coach.ipynb \
curl -O https://us-west-2-aws-training.s3.amazonaws.com/awsu-spl-dev/spl-227/scripts/rl_deepracer_robomaker_coach.zip \
unzip rl_deepracer_robomaker_coach.zip \
chown ec2-user:ec2-user -R /home/ec2-user/SageMaker