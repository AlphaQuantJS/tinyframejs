const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');

async function run() {
  try {
    // Get input parameters
    const openaiApiKey = core.getInput('openai_api_key', { required: true });
    const githubToken = core.getInput('github_token', { required: true });

    // Get PR context
    const context = github.context;
    if (context.payload.pull_request) {
      const prNumber = context.payload.pull_request.number;
      const repo = context.repo.repo;
      const owner = context.repo.owner;

      console.log(`Analyzing PR #${prNumber} in ${owner}/${repo}`);

      // Set environment variables
      process.env.OPENAI_API_KEY = openaiApiKey;
      process.env.GITHUB_TOKEN = githubToken;

      // Run PR analysis with OpenAI

      const command = `npx pr-codex review --pr ${prNumber} --repo ${owner}/${repo}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          core.setFailed(`PR Codex execution failed: ${error.message}`);
          return;
        }

        if (stderr) {
          console.error(`PR Codex stderr: ${stderr}`);
        }

        console.log(`PR Codex output: ${stdout}`);
        core.info('PR Codex analysis completed successfully');
      });
    } else {
      core.info('This action only works on pull requests');
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
