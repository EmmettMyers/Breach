# Breach - Hack Midwest 2025 (Frontend)

Live Demo: [https://breach-ai.web.app/](https://breach-ai.web.app/)

<strong>Team:</strong> Emmett Myers, Joseph Seibel<br/>
<strong>Challenges:</strong> Brale Stablecoin Challenge, AWS Strands Agents SDK Challenge

Breach is a platform that connects AI model creators with security testers to identify vulnerabilities through controlled jailbreaking attempts, with economic incentives powered by stablecoins.<br/>

This is the frontend repository, the backend repository is located [here](https://github.com/j-seibel/breach-backend).

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables
- `VITE_API_URL` - Backend API URL
- `VITE_SBC_API_KEY` - SBC API key for stablecoin integration
- `VITE_SBC_TOKEN_ADDRESS` - SBC token contract address
- `VITE_DEFAULT_RECIPIENT_ADDRESS` - Default recipient for SBC transfers
- `VITE_BASE_RPC_URL_1`, `VITE_BASE_RPC_URL_2`, `VITE_BASE_RPC_URL_3` - Base network RPC endpoints

**Note:** All environment variables are required. The application will not function properly without them.

<strong>*UPDATE:*</strong> The project placed <strong>1st</strong> the Hack Midwest Brale API Challenge and Best Collegiate Team tracks!
