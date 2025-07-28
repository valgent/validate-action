# Valgent Validate Action

GitHub Action to validate AI agent cards against the A2A specification using [Valgent](https://valgent.io).

## ✅ Features

- **Fast Validation** - Validate agent cards in seconds
- **A2A Compliance** - Full A2A v0.2.6 specification validation
- **Quality Scoring** - Get 0-100 quality scores for your agent cards
- **Smart Suggestions** - Receive actionable improvement recommendations
- **Flexible Usage** - Works with or without API keys
- **Rich Output** - Detailed validation results as action outputs

## 🚀 Quick Start

### Basic Usage (Free Tier)

```yaml
name: Validate Agent Card
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
```

### With API Key (Unlimited)

```yaml
name: Validate Agent Card
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
          api-key: ${{ secrets.VALGENT_API_KEY }}
```

### Advanced Usage

```yaml
name: Comprehensive Agent Card Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate Agent Card
        id: validate
        uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
          api-key: ${{ secrets.VALGENT_API_KEY }}
          fail-on-warnings: true
          include-score: true
          include-suggestions: true
      
      - name: Display Results
        run: |
          echo "Valid: ${{ steps.validate.outputs.valid }}"
          echo "Score: ${{ steps.validate.outputs.score }}/100"
          echo "Summary:"
          echo "${{ steps.validate.outputs.summary }}"
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const summary = `${{ steps.validate.outputs.summary }}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Agent Card Validation Results\n\n\`\`\`\n${summary}\n\`\`\``
            });
```

## 📋 Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `agent-card-path` | Path to the agent card JSON file | ✅ | - |
| `api-key` | Valgent API key (get from [valgent.io](https://valgent.io/dashboard)) | ❌ | - |
| `fail-on-warnings` | Fail the action if validation has warnings | ❌ | `false` |
| `include-score` | Include quality score in output | ❌ | `true` |
| `include-suggestions` | Include improvement suggestions | ❌ | `true` |

## 📤 Outputs

| Output | Description | Type |
|--------|-------------|------|
| `valid` | Whether the agent card is valid | `string` (`"true"`/`"false"`) |
| `score` | Quality score (0-100, if enabled) | `string` |
| `errors` | JSON array of validation errors | `string` |
| `warnings` | JSON array of validation warnings | `string` |
| `suggestions` | JSON array of improvement suggestions | `string` |
| `summary` | Human-readable validation summary | `string` |

## 🔑 Authentication

### Without API Key (Free Tier)
- **5 validations per day** per repository
- Basic validation features
- Perfect for open source projects

### With API Key
1. Sign up at [valgent.io](https://valgent.io)
2. Go to Dashboard → API Keys
3. Generate a new API key
4. Add it as a repository secret: `VALGENT_API_KEY`

**Benefits:**
- **Unlimited validations** (Pro/Team plans)
- **Validation history** tracking
- **Priority support**

## 🎯 Use Cases

### Pre-commit Validation
```yaml
name: Pre-commit
on: [push]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
          fail-on-warnings: true
```

### Multi-file Validation
```yaml
name: Validate Multiple Cards
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        card: ['./agents/chat-agent.json', './agents/code-agent.json']
    steps:
      - uses: actions/checkout@v4
      - uses: valgent/validate-action@v1
        with:
          agent-card-path: ${{ matrix.card }}
```

### Release Validation
```yaml
name: Release
on:
  release:
    types: [published]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
          api-key: ${{ secrets.VALGENT_API_KEY }}
          fail-on-warnings: true
      - name: Deploy if valid
        run: echo "Deploying validated agent card..."
```

### Quality Gate
```yaml
name: Quality Gate
on: [pull_request]
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Agent Card
        id: validate
        uses: valgent/validate-action@v1
        with:
          agent-card-path: './agent-card.json'
          api-key: ${{ secrets.VALGENT_API_KEY }}
      
      - name: Enforce Quality Score
        run: |
          score=${{ steps.validate.outputs.score }}
          if [ "$score" -lt 80 ]; then
            echo "Quality score ($score) is below threshold (80)"
            exit 1
          fi
          echo "Quality score ($score) meets threshold ✅"
```

## 🛠️ Development

### Setup
```bash
# Clone the repository
git clone https://github.com/valgent/validate-action
cd validate-action

# Install dependencies
npm install

# Build the action
npm run build

# Run tests
npm test
```

### Testing Locally
```bash
# Set environment variables
export INPUT_AGENT-CARD-PATH="./test/valid-agent-card.json"
export INPUT_API-KEY="your-api-key"

# Run the action
npm run dev
```

## 📝 Example Agent Card

```json
{
  "name": "Code Review Assistant",
  "description": "An AI agent that performs comprehensive code reviews",
  "version": "1.0.0",
  "url": "https://api.codereview.ai/agent",
  "protocolVersion": "0.2.6",
  "skills": [
    {
      "id": "code-review",
      "name": "Code Review",
      "description": "Analyzes code for bugs and best practices",
      "tags": ["code-quality", "static-analysis"]
    }
  ],
  "capabilities": {
    "streaming": true
  },
  "defaultInputModes": ["text", "file"],
  "defaultOutputModes": ["text", "structured"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Valgent Website](https://valgent.io)
- [API Documentation](https://www.valgent.io/docs/api/authentication)
- [CLI Tool](https://www.npmjs.com/package/@valgent/cli)
- [A2A Specification](https://a2aprotocol.ai)

---

Made with ❤️ by the [Valgent](https://valgent.io) team
