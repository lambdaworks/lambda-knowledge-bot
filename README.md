<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./banner-light.svg">
  <img src="./banner-light.svg" alt="Banner">
</picture>

# Description

Knowle is a Slack bot meant for answering questions from documentation, such as a company's knowledge base, with the help of vector databases and Large Language Models.

# Behavior

The bot responds to all messages sent to the bot through DMs, and to all messages it is mentioned in that are sent to channels the bot is a part of. Each reply is in a thread under the user's message. The reply is streamed to the user, and at the end of the response, all of the relevant documents are returned, along with a 👍 and 👎 message reaction meant as a way for the user to give feedback to the received response. Multiple users can get a response from the bot at the same time, while a single user's messages get a response in the order they are received in, barring initial feedback messages.

# Dependencies

The application is written entirely in Scala 2.13, utilizing Akka's actor model for core functionality, while employing Akka Streams and Akka HTTP with spray-json for streaming and HTTP server/client operations, respectively. For LLM uses the application relies on LangChain, a Python library accessed through ScalaPy Facades. For interaction with the Slack API, the Akka-based scala-slack-client is used.

# Running instructions

To start this application, you can use the following command:

```
sbt knowledgeBot/run
```

In order for this application to run and behave correctly, you need to make sure ScalaPy can access your Python installation. You can refer to [ScalaPy's website](https://scalapy.dev/docs/) for more information. Also, make sure to install all required dependencies as per `requirements.txt`, using the following command:

```
pip install -r requirements.txt
```

This application requires some services running to function correctly:

- Qdrant account with an active cluster
- DynamoDB table with `Channel` as a string primary key and `Timestamp` as an integer sort key
- GitHub repository hosting the documents with a webhook triggered on push events
  - Each document must have a name in following format: `document_name_id1_id2`
- RTM-based Slack bot with `bot` and `chat:write:bot` OAuth scopes
- OpenAI account

The rest of the setup revolves around providing the environment variables outlined in `application.conf`, so that the application can access all of the required services. Below is the table containing the necessary information to provide the required values for the environment variables:

| Variable               | Description                                                            | Default/Pattern |
| ---------------------- | -----------------------------------------------------------------------| --------------- |
| SCALAPY_PYTHON_LIBRARY | Python version used (only if not 3.{7, 8, 9})                          | python3.x       |
| CLICKUP_COMMON_DOC_URL | The common part of the URL for every document                          |                 |
| DYNAMODB_REGION        | Region the DynamoDB table is in                                        |                 |
| DYNAMODB_TABLE_NAME    | Name of the DynamoDB table                                             |                 |
| GITHUB_TOKEN           | Personal GitHub access token with read access to the GitHub repository |                 |
| GITHUB_USER            | The name of the user/organization owning the GitHub repository         |                 |
| GITHUB_REPO            | The name of the GitHub repository containing the documents             |                 |
| GITHUB_WEBHOOK_SECRET  | The secret used for the GitHub webhook                                 |                 |
| GITHUB_WEBHOOK_HOST    | Host of the server receiving the webhook payload                       | 0.0.0.0         |
| GITHUB WEBHOOK PORT    | Port of the server receiving the webhook payload                       | 8080            |
| QDRANT_CLUSTER_URL     | URL of the Qdrant cluster containing the collection                    |                 |
| SLACK_TOKEN            | Slack User OAuth token                                                 |                 |
| OPENAI_API_KEY         | OpenAI API key                                                         |                 |
| QDRANT_API_KEY         | Qdrant API key                                                         |                 |
| QDRANT_COLLECTION_NAME | Name of the Qdrant collection where vector embeddings are stored       |                 |

If you want to run the application locally, you can store the environment variables in a `.env` file placed in the root directory.

You can build a Docker image using the following command:
 
```
sbt docker:publishLocal
```
