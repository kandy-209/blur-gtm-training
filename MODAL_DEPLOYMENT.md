# Modal Deployment Guide

## Quick Start

### 1. Install Modal CLI
```bash
pip install modal
```

### 2. Authenticate
```bash
modal token new
```

### 3. Setup Secrets
```bash
bash modal_functions/setup_secrets.sh
```

Or manually:
```bash
modal secret create openai-secret OPENAI_API_KEY=your_key
modal secret create anthropic-secret ANTHROPIC_API_KEY=your_key
modal secret create vapi-secret VAPI_API_KEY=your_key
```

### 4. Deploy Function
```bash
modal deploy modal_functions/analyze_call.py
```

### 5. Get Function URL
After deployment, Modal will provide a URL like:
```
https://your-username--sales-call-analysis-analyze-call-endpoint.modal.run
```

### 6. Add to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `MODAL_FUNCTION_URL` = your Modal function URL
3. Add: `VAPI_API_KEY` = your Vapi API key
4. Redeploy

## Testing

### Test Modal Function Locally
```bash
modal run modal_functions/analyze_call.py::analyze_sales_call \
  --call-id "test_123" \
  --scenario-id "SKEPTIC_VPE_001" \
  --transcript "Sample transcript..."
```

### Test via API
```bash
curl -X POST https://your-function-url.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_123",
    "scenario_id": "SKEPTIC_VPE_001",
    "transcript": "Sample transcript..."
  }'
```

## Monitoring

View logs:
```bash
modal app logs sales-call-analysis
```

View function metrics:
```bash
modal app show sales-call-analysis
```

## Cost Estimation

- Modal: ~$0.10/hour for compute (only when running)
- Vercel: Existing plan
- Vapi: Per-minute pricing

Typical cost per call analysis: ~$0.01-0.02

## Troubleshooting

### Function not deploying
- Check Modal authentication: `modal token list`
- Verify secrets exist: `modal secret list`
- Check function syntax: `modal deploy --dry-run`

### Analysis failing
- Verify API keys in secrets
- Check Modal logs: `modal app logs sales-call-analysis`
- Test function locally first

### Integration issues
- Verify MODAL_FUNCTION_URL in Vercel env vars
- Check CORS settings
- Verify function endpoint accepts POST requests

