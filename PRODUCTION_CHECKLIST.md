# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Environment Setup
- [ ] Node.js 20+ installed
- [ ] All dependencies installed (`npm ci`)
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)

### Database Setup
- [ ] Supabase project created (or PostgreSQL database)
- [ ] Database migrations run (`scripts/migrate-database.sql`)
- [ ] Indexes created for performance
- [ ] Row Level Security policies configured
- [ ] Database connection tested

### Environment Variables
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `ELEVENLABS_API_KEY` - ElevenLabs API key (optional)
- [ ] `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - ElevenLabs agent ID (optional)
- [ ] `ALLOWED_ORIGINS` - Comma-separated allowed origins
- [ ] `NODE_ENV=production` - Set to production

### Code Changes
- [ ] Database implementation switched to production (`db-production.ts`)
- [ ] Error handling reviewed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation in place

## Deployment

### Vercel Setup
- [ ] Vercel account created
- [ ] Project connected to Git repository
- [ ] All environment variables added in Vercel dashboard
- [ ] Build settings configured
- [ ] Domain configured (if using custom domain)

### Deployment Steps
- [ ] Code pushed to main branch
- [ ] Deployment triggered
- [ ] Build successful
- [ ] Site accessible
- [ ] API routes working

## Post-Deployment

### Functionality Testing
- [ ] Home page loads
- [ ] Scenarios page accessible
- [ ] Role-play engine works
- [ ] AI responses generated
- [ ] Responses saved to database
- [ ] Analytics page displays data
- [ ] Top responses visible
- [ ] Technical questions visible

### Performance
- [ ] Page load times acceptable
- [ ] API response times < 2s
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size reasonable

### Security
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] API keys not exposed
- [ ] Rate limiting working
- [ ] Input validation working

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Vercel Analytics)
- [ ] Uptime monitoring set up
- [ ] Log aggregation configured
- [ ] Alerts configured

### Database
- [ ] Data persisting correctly
- [ ] Queries performing well
- [ ] Backups enabled
- [ ] Connection pooling configured
- [ ] Indexes used effectively

## Maintenance

### Regular Tasks
- [ ] Monitor error rates weekly
- [ ] Review analytics monthly
- [ ] Check database size monthly
- [ ] Update dependencies quarterly
- [ ] Review security quarterly
- [ ] Backup verification monthly

### Scaling Considerations
- [ ] Database connection limits monitored
- [ ] API rate limits monitored
- [ ] Storage capacity monitored
- [ ] CDN performance monitored
- [ ] Cost optimization reviewed

## Rollback Plan

If issues occur:
- [ ] Previous deployment identified
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Environment variables backed up
- [ ] Team notified

## Support Resources

- **Documentation**: `PRODUCTION.md` - Full production guide
- **Quick Start**: `QUICK_START_PRODUCTION.md` - 5-minute setup
- **Database**: `DATABASE.md` - Database documentation
- **Security**: `SECURITY.md` - Security features

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **OpenAI Support**: help@openai.com

---

**Last Updated**: $(date)
**Deployed By**: ________________
**Deployment Date**: ________________

