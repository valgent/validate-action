import * as core from '@actions/core';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface ValidationResponse {
  valid: boolean;
  score?: number;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
  suggestions?: string[];
}

async function validateAgentCard(
  agentCard: unknown,
  apiKey?: string,
  includeScore: boolean = true,
  includeSuggestions: boolean = true
): Promise<ValidationResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if provided
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const requestBody = {
    agent_card: agentCard,
    options: {
      include_score: includeScore,
      include_suggestions: includeSuggestions,
    },
  };

  try {
    const response = await fetch('https://api.valgent.io/v1/validate', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json() as ValidationResponse;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to validate agent card: ${error.message}`);
    }
    throw new Error('Failed to validate agent card: Unknown error');
  }
}

function generateSummary(result: ValidationResponse): string {
  const status = result.valid ? '✅ VALID' : '❌ INVALID';
  const score = result.score ? ` (Score: ${result.score}/100)` : '';
  
  let summary = `Agent Card Validation: ${status}${score}\n\n`;

  if (result.errors.length > 0) {
    summary += `🚫 Errors (${result.errors.length}):\n`;
    result.errors.forEach((error, index) => {
      summary += `  ${index + 1}. ${error.path}: ${error.message}\n`;
    });
    summary += '\n';
  }

  if (result.warnings.length > 0) {
    summary += `⚠️  Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach((warning, index) => {
      summary += `  ${index + 1}. ${warning.path}: ${warning.message}\n`;
    });
    summary += '\n';
  }

  if (result.suggestions && result.suggestions.length > 0) {
    summary += `💡 Suggestions (${result.suggestions.length}):\n`;
    result.suggestions.forEach((suggestion, index) => {
      summary += `  ${index + 1}. ${suggestion}\n`;
    });
  }

  return summary;
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const agentCardPath = core.getInput('agent-card-path', { required: true });
    const apiKey = core.getInput('api-key') || undefined;
    const failOnWarnings = core.getBooleanInput('fail-on-warnings');
    const includeScore = core.getBooleanInput('include-score');
    const includeSuggestions = core.getBooleanInput('include-suggestions');

    core.info(`Validating agent card: ${agentCardPath}`);

    // Check if file exists
    const fullPath = resolve(agentCardPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Agent card file not found: ${fullPath}`);
    }

    // Read and parse agent card
    let agentCard: unknown;
    try {
      const fileContent = readFileSync(fullPath, 'utf8');
      agentCard = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse agent card JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate agent card
    core.info('Calling Valgent API...');
    const result = await validateAgentCard(
      agentCard,
      apiKey,
      includeScore,
      includeSuggestions
    );

    // Set outputs
    core.setOutput('valid', result.valid.toString());
    core.setOutput('errors', JSON.stringify(result.errors));
    core.setOutput('warnings', JSON.stringify(result.warnings));
    
    if (result.score !== undefined) {
      core.setOutput('score', result.score.toString());
    }
    
    if (result.suggestions) {
      core.setOutput('suggestions', JSON.stringify(result.suggestions));
    }

    // Generate and set summary
    const summary = generateSummary(result);
    core.setOutput('summary', summary);

    // Log results
    core.info('\n' + summary);

    // Determine if action should fail
    const shouldFail = !result.valid || (failOnWarnings && result.warnings.length > 0);

    if (shouldFail) {
      const reason = !result.valid 
        ? `Agent card validation failed with ${result.errors.length} error(s)`
        : `Agent card has ${result.warnings.length} warning(s) and fail-on-warnings is enabled`;
      
      core.setFailed(reason);
    } else {
      core.info('✅ Agent card validation completed successfully!');
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    core.setFailed(`Action failed: ${message}`);
  }
}

// Run the action
if (require.main === module) {
  run();
}

export { run, validateAgentCard };