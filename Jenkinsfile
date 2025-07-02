pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        PORT = "8001"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/prod']], 
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'PROD-PAT',
                        url: 'https://github.com/KollegeApply/KollegeApply-backend'
                    ]]
                )
            }
        }

        stage('Installing Dependencies') {
            steps {
                sh 'npm install --unsafe-perm'
            }
        }

        stage('Building Project') {
            steps {
                script {
                    sh 'rm -rf dist || true'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploying Application') {
            steps {
                script {
                    // ✅ Zero-downtime deployment using PM2
                    sh """
                        if pm2 list | grep -q 'kollegeapply-prod-backend'; then
                            pm2 reload kollegeapply-prod-backend --update-env --wait-ready --kill-timeout 3000
                        else
                            pm2 start npm --name 'kollegeapply-prod-backend' -- start
                        fi
                    """

                    // Save PM2 process list
                    sh "pm2 save"
                }
            }
        }

        stage('Print Success Message') {
            steps {
                echo '🚀 Production Deployment Successful without downtime!'
            }
        }
    }
}
