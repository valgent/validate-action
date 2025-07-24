# Changelog

All notable changes to the Valgent Validate Action will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-24

### Added
- Initial release of Valgent Validate Action
- Support for A2A v0.2.6 agent card validation
- Quality scoring and improvement suggestions
- Authentication via API keys
- Comprehensive error handling and reporting
- Rich GitHub Action outputs
- Support for both free and authenticated usage tiers
- Detailed validation summaries
- Configurable failure conditions
- TypeScript implementation with full type safety

### Features
- **Free Tier**: 5 validations per day without API key
- **Authenticated**: Unlimited validations with API key
- **Quality Scoring**: 0-100 scores for agent cards
- **Smart Suggestions**: Actionable improvement recommendations
- **Flexible Configuration**: Multiple input options
- **Rich Outputs**: JSON and human-readable formats

### Supported Inputs
- `agent-card-path` - Path to agent card JSON file
- `api-key` - Optional Valgent API key
- `fail-on-warnings` - Fail action on warnings
- `include-score` - Include quality scoring
- `include-suggestions` - Include improvement suggestions
- `api-url` - Custom API URL for testing

### Outputs
- `valid` - Validation result (true/false)
- `score` - Quality score (0-100)
- `errors` - JSON array of errors
- `warnings` - JSON array of warnings
- `suggestions` - JSON array of suggestions
- `summary` - Human-readable summary