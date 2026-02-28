# 🤖 Scripts de Automação — Campanhas ÓoDelivery

> **Automação para marketing, social media e vendas**  
> **Versão:** 26/02/2026

---

## 📋 Índice

1. [Instagram Auto-Poster](#instagram-auto-poster)
2. [Facebook Ads Automation](#facebook-ads-automation)
3. [Google Ads Automation](#google-ads-automation)
4. [Email Marketing Automation](#email-marketing-automation)
5. [Lead Scoring & Nurturing](#lead-scoring--nurturing)
6. [Social Media Scheduler](#social-media-scheduler)
7. [Analytics Dashboard](#analytics-dashboard)
8. [WhatsApp Broadcast](#whatsapp-broadcast)

---

## 1️⃣ Instagram Auto-Poster

**Objetivo:** Postar automaticamente no Instagram com legenda e hashtags

### Pré-requisitos

```bash
npm install instagram-private-api axios dotenv
```

### Script: `instagram-poster.js`

```javascript
// scripts/marketing/instagram-poster.js
require('dotenv').config();
const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const path = require('path');

class InstagramPoster {
    constructor() {
        this.ig = new IgApiClient();
        this.username = process.env.INSTAGRAM_USERNAME;
        this.password = process.env.INSTAGRAM_PASSWORD;
    }

    async authenticate() {
        console.log('🔐 Autenticando no Instagram...');
        this.ig.state.generateDevice(this.username);
        await this.ig.account.login(this.username, this.password);
        console.log('✅ Autenticado com sucesso!');
    }

    async postFeed(imagePath, caption, location = null) {
        try {
            console.log('📸 Postando no feed...');
            
            const image = fs.readFileSync(imagePath);
            
            const post = await this.ig.publish.photo({
                file: image,
                caption: caption,
                location: location ? {
                    name: location.name,
                    lat: location.lat,
                    lng: location.lng
                } : null
            });

            console.log('✅ Post publicado com sucesso!');
            console.log(`📊 ID do Post: ${post.media.id}`);
            
            return post;
        } catch (error) {
            console.error('❌ Erro ao postar:', error.message);
            throw error;
        }
    }

    async postStory(imagePath, stickerText = null) {
        try {
            console.log('📱 Postando nos stories...');
            
            const image = fs.readFileSync(imagePath);
            
            const post = await this.ig.publish.story({
                file: image,
            });

            console.log('✅ Story publicado com sucesso!');
            
            return post;
        } catch (error) {
            console.error('❌ Erro ao postar story:', error.message);
            throw error;
        }
    }

    async schedulePost(imagePath, caption, scheduleTime) {
        console.log(`⏰ Agendando post para: ${scheduleTime}`);
        
        // Salvar em fila para processamento posterior
        const queue = {
            imagePath,
            caption,
            scheduledFor: new Date(scheduleTime),
            status: 'pending'
        };

        // Salvar em banco de dados ou arquivo
        fs.writeFileSync(
            path.join(__dirname, 'instagram-queue.json'),
            JSON.stringify(queue, null, 2)
        );

        console.log('✅ Post agendado!');
    }
}

// Uso
async function main() {
    const poster = new InstagramPoster();
    
    await poster.authenticate();

    // Post 1 - Lançamento
    await poster.postFeed(
        path.join(__dirname, '../../design-assets/instagram/posts/post-01-lancamento.png'),
        `🚀 CHEGOU A REVOLUÇÃO DO DELIVERY!

Seu delivery no automático é realidade com o ÓoDelivery!

✅ Cardápio digital profissional
✅ WhatsApp automático (ÓoBot)
✅ PDV integrado
✅ Sistema de motoboys
✅ Programa de fidelidade
✅ Zonas de entrega inteligentes

Tudo isso por apenas R$129,90/mês!

👉 Link na bio para teste grátis!

#OoDelivery #DeliveryNoAutomatico #RestauranteSemEstresse #DeliveryInteligente #GestaoDeRestaurante #WhatsAppBusiness #PDV #FidelidadeDeClientes #Delivery #FoodService`
    );
}

main().catch(console.error);
```

### Configuração: `.env`

```env
# Instagram
INSTAGRAM_USERNAME=oodelivery
INSTAGRAM_PASSWORD=sua-senha-aqui

# Facebook (para Instagram Graph API - recomendado)
FACEBOOK_APP_ID=seu-app-id
FACEBOOK_APP_SECRET=seu-app-secret
FACEBOOK_PAGE_ID=sua-page-id
FACEBOOK_ACCESS_TOKEN=seu-access-token
```

### Agendamento com Cron

```javascript
// scripts/marketing/scheduler.js
const cron = require('node-cron');
const InstagramPoster = require('./instagram-poster');

// Postar todo dia às 10:00
cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Hora de postar!');
    
    const poster = new InstagramPoster();
    await poster.authenticate();
    
    // Selecionar post do dia
    const posts = getPostsDaSemana();
    const postDeHoje = posts[new Date().getDay()];
    
    await poster.postFeed(
        postDeHoje.imagePath,
        postDeHoje.caption
    );
});

console.log('🤖 Scheduler iniciado. Postagens automáticas ativadas.');
```

---

## 2️⃣ Facebook Ads Automation

**Objetivo:** Criar e gerenciar campanhas automaticamente via API

### Pré-requisitos

```bash
npm install facebook-node-sdk
```

### Script: `facebook-ads-manager.js`

```javascript
// scripts/marketing/facebook-ads-manager.js
require('dotenv').config();
const FacebookAds = require('facebook-node-sdk').FacebookAds;

class FacebookAdsManager {
    constructor() {
        this.api = new FacebookAds({
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            accessToken: process.env.FACEBOOK_ACCESS_TOKEN
        });
        this.pageId = process.env.FACEBOOK_PAGE_ID;
        this.adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
    }

    async createCampaign(campaignConfig) {
        try {
            console.log('🎯 Criando campanha...');

            const campaign = await this.api.call('POST', `/act_${this.adAccountId}/campaigns`, {
                name: campaignConfig.name,
                objective: campaignConfig.objective, // BRAND_AWARENESS, TRAFFIC, CONVERSIONS
                status: 'PAUSED', // Criar pausada para revisão
                special_ad_categories: [],
                buying_type: 'AUCTION',
            });

            console.log(`✅ Campanha criada: ${campaign.id}`);
            return campaign.id;
        } catch (error) {
            console.error('❌ Erro ao criar campanha:', error.message);
            throw error;
        }
    }

    async createAdSet(campaignId, adSetConfig) {
        try {
            console.log('📦 Criando conjunto de anúncios...');

            const adSet = await this.api.call('POST', `/act_${this.adAccountId}/adsets`, {
                campaign_id: campaignId,
                name: adSetConfig.name,
                targeting: {
                    age_min: adSetConfig.ageMin,
                    age_max: adSetConfig.ageMax,
                    geo_locations: {
                        countries: ['BR']
                    },
                    interests: adSetConfig.interests.map(id => ({ id })),
                    behaviors: adSetConfig.behaviors?.map(id => ({ id }))
                },
                billing_event: 'IMPRESSIONS',
                optimization_goal: adSetConfig.optimizationGoal,
                bid_amount: adSetConfig.bidAmount,
                daily_budget: adSetConfig.dailyBudget,
                status: 'PAUSED'
            });

            console.log(`✅ AdSet criado: ${adSet.id}`);
            return adSet.id;
        } catch (error) {
            console.error('❌ Erro ao criar adset:', error.message);
            throw error;
        }
    }

    async createAd(adSetId, adConfig) {
        try {
            console.log('📢 Criando anúncio...');

            const ad = await this.api.call('POST', `/act_${this.adAccountId}/ads`, {
                adset_id: adSetId,
                name: adConfig.name,
                creative: {
                    creative_id: await this.createCreative(adConfig)
                },
                status: 'PAUSED'
            });

            console.log(`✅ Anúncio criado: ${ad.id}`);
            return ad.id;
        } catch (error) {
            console.error('❌ Erro ao criar anúncio:', error.message);
            throw error;
        }
    }

    async createCreative(adConfig) {
        // Upload de imagem/vídeo
        const media = await this.api.call('POST', `/act_${this.adAccountId}/adimages`, {
            filename: adConfig.mediaFilename
        });

        const creative = await this.api.call('POST', `/${this.adAccountId}/adcreatives`, {
            name: adConfig.name,
            object_story_spec: {
                page_id: this.pageId,
                link_data: {
                    link: adConfig.link,
                    message: adConfig.message,
                    picture: media.id,
                    name: adConfig.headline,
                    description: adConfig.description,
                    call_to_action: {
                        type: adConfig.ctaType // LEARN_MORE, SIGN_UP, SHOP_NOW
                    }
                }
            }
        });

        return creative.id;
    }

    async activateCampaign(campaignId) {
        try {
            console.log('🚀 Ativando campanha...');

            await this.api.call('POST', `/act_${this.adAccountId}/campaigns`, {
                id: campaignId,
                status: 'ACTIVE'
            });

            console.log('✅ Campanha ativada!');
        } catch (error) {
            console.error('❌ Erro ao ativar campanha:', error.message);
            throw error;
        }
    }

    async getCampaignInsights(campaignId) {
        try {
            const insights = await this.api.call('GET', `/${campaignId}/insights`, {
                fields: 'impressions,clicks,spend,conversions,ctr,frequency'
            });

            return insights;
        } catch (error) {
            console.error('❌ Erro ao buscar insights:', error.message);
            throw error;
        }
    }

    async pauseUnderperformingAds(campaignId, threshold = 0.01) {
        const insights = await this.getCampaignInsights(campaignId);
        
        for (const ad of insights.data) {
            const ctr = ad.ctr;
            if (ctr < threshold) {
                console.log(`⏸️ Pausando anúncio com CTR baixo: ${ad.id} (CTR: ${ctr})`);
                await this.pauseAd(ad.id);
            }
        }
    }

    async pauseAd(adId) {
        await this.api.call('POST', `/${adId}`, {
            status: 'PAUSED'
        });
    }
}

// Uso
async function createFullCampaign() {
    const manager = new FacebookAdsManager();

    // Campanha de Conscientização
    const campaignId = await manager.createCampaign({
        name: 'ÓoDelivery - Conscientização - Fevereiro 2026',
        objective: 'BRAND_AWARENESS'
    });

    const adSetId = await manager.createAdSet(campaignId, {
        name: 'Donos de Restaurante 25-55',
        ageMin: 25,
        ageMax: 55,
        interests: [
            '6003139266461', // Restaurantes
            '6003107906415', // Delivery de comida
            '6003225075113'  // iFood
        ],
        behaviors: [
            '6002714930953' // Administradores de páginas do Facebook
        ],
        optimizationGoal: 'REACH',
        bidAmount: 100,
        dailyBudget: 5000 // R$50/dia em centavos
    });

    await manager.createAd(adSetId, {
        name: 'Vídeo - Um Dia no Delivery',
        mediaFilename: 'reel-01-um-dia.mp4',
        link: 'https://oodelivery.com.br/teste-gratis',
        message: '🍕 DONO DE DELIVERY! Você trabalha 12h por dia e o lucro não aparece?',
        headline: 'Seu Delivery no Automático',
        description: 'Teste grátis por 7 dias',
        ctaType: 'LEARN_MORE'
    });

    await manager.activateCampaign(campaignId);
}

module.exports = FacebookAdsManager;
```

---

## 3️⃣ Google Ads Automation

**Objetivo:** Gerenciar campanhas Google Ads via API

### Pré-requisitos

```bash
npm install google-ads-api
```

### Script: `google-ads-manager.js`

```javascript
// scripts/marketing/google-ads-manager.js
require('dotenv').config();
const {GoogleAdsClient} = require('google-ads-api');

class GoogleAdsManager {
    constructor() {
        this.client = new GoogleAdsClient({
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
            refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
            client_id: process.env.GOOGLE_ADS_CLIENT_ID,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
        });
        
        this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    }

    async createCampaign(campaignConfig) {
        try {
            console.log('🎯 Criando campanha Google Ads...');

            const campaignOperation = {
                create: {
                    name: campaignConfig.name,
                    advertising_channel_type: 'SEARCH',
                    status: 'PAUSED',
                    bidding_strategy_type: 'MANUAL_CPC',
                    manual_cpc: {
                        enhanced_cpc_enabled: true
                    },
                    network_settings: {
                        target_google_search: true,
                        target_search_network: true,
                        target_content_network: false
                    },
                    geo_target_type_setting: {
                        positive_geo_target_type: 'PRESENCE',
                        negative_geo_target_type: 'PRESENCE_OR_INTEREST'
                    }
                }
            };

            const response = await this.client.mutate({
                customerId: this.customerId,
                campaignOperations: [campaignOperation]
            });

            const campaignId = response.results[0].resource_name;
            console.log(`✅ Campanha criada: ${campaignId}`);
            
            return campaignId;
        } catch (error) {
            console.error('❌ Erro ao criar campanha:', error.message);
            throw error;
        }
    }

    async createAdGroup(campaignId, adGroupConfig) {
        try {
            console.log('📦 Criando grupo de anúncios...');

            const adGroupOperation = {
                create: {
                    name: adGroupConfig.name,
                    campaign: campaignId,
                    status: 'ENABLED',
                    cpc_bid_micros: adGroupConfig.cpcBidMicros
                }
            };

            const response = await this.client.mutate({
                customerId: this.customerId,
                adGroupOperations: [adGroupOperation]
            });

            const adGroupId = response.results[0].resource_name;
            console.log(`✅ AdGroup criado: ${adGroupId}`);
            
            return adGroupId;
        } catch (error) {
            console.error('❌ Erro ao criar adgroup:', error.message);
            throw error;
        }
    }

    async addKeywords(adGroupId, keywords) {
        try {
            console.log('🔑 Adicionando palavras-chave...');

            const keywordOperations = keywords.map(keyword => ({
                create: {
                    ad_group: adGroupId,
                    status: 'ENABLED',
                    criterion: {
                        text: keyword.text,
                        match_type: keyword.matchType // EXACT, PHRASE, BROAD
                    }
                }
            }));

            await this.client.mutate({
                customerId: this.customerId,
                keywordOperations: keywordOperations
            });

            console.log(`✅ ${keywords.length} palavras-chave adicionadas!`);
        } catch (error) {
            console.error('❌ Erro ao adicionar keywords:', error.message);
            throw error;
        }
    }

    async createResponsiveSearchAd(adGroupId, adConfig) {
        try {
            console.log('📢 Criando anúncio...');

            const adOperation = {
                create: {
                    ad_group: adGroupId,
                    status: 'ENABLED',
                    final_urls: [adConfig.finalUrl],
                    responsive_search_ad: {
                        headlines: adConfig.headlines.map(text => ({ text })),
                        descriptions: adConfig.descriptions.map(text => ({ text }))
                    }
                }
            };

            const response = await this.client.mutate({
                customerId: this.customerId,
                adOperations: [adOperation]
            });

            const adId = response.results[0].resource_name;
            console.log(`✅ Anúncio criado: ${adId}`);
            
            return adId;
        } catch (error) {
            console.error('❌ Erro ao criar anúncio:', error.message);
            throw error;
        }
    }

    async getReport(query) {
        try {
            const response = await this.client.query({
                customerId: this.customerId,
                query
            });

            return response;
        } catch (error) {
            console.error('❌ Erro ao buscar relatório:', error.message);
            throw error;
        }
    }

    async optimizeBids(campaignId) {
        const report = await this.getReport(`
            SELECT 
                campaign.id,
                ad_group.id,
                criteria.id,
                metrics.cost_micros,
                metrics.conversions,
                metrics.ctr,
                bidding_strategy.id
            FROM keyword_view
            WHERE 
                campaign.id = ${campaignId}
                AND segments.date DURING LAST_7_DAYS
        `);

        for (const row of report) {
            const ctr = row.metrics.ctr;
            const conversions = row.metrics.conversions;

            if (conversions === 0 && ctr < 0.02) {
                console.log(`⬇️ Reduzindo bid para keyword: ${row.criteria.id}`);
                // Lógica para reduzir bid
            } else if (conversions > 5 && ctr > 0.05) {
                console.log(`⬆️ Aumentando bid para keyword: ${row.criteria.id}`);
                // Lógica para aumentar bid
            }
        }
    }
}

// Uso
async function createSearchCampaign() {
    const manager = new GoogleAdsManager();

    const campaignId = await manager.createCampaign({
        name: 'ÓoDelivery - Search - Sistema Delivery',
        cpcBidMicros: 3500000 // R$3,50
    });

    const adGroupId = await manager.createAdGroup(campaignId, {
        name: 'Sistema para Delivery',
        cpcBidMicros: 3500000
    });

    await manager.addKeywords(adGroupId, [
        { text: 'sistema para delivery', matchType: 'EXACT' },
        { text: 'delivery online', matchType: 'EXACT' },
        { text: 'cardápio digital', matchType: 'EXACT' },
        { text: 'whatsapp automático', matchType: 'PHRASE' }
    ]);

    await manager.createResponsiveSearchAd(adGroupId, {
        finalUrl: 'https://oodelivery.com.br',
        headlines: [
            'Sistema Para Delivery',
            'ÓoDelivery - Teste Grátis',
            '7 Dias Sem Compromisso'
        ],
        descriptions: [
            'Cardápio Digital, WhatsApp Automático, PDV e Mais. Tudo em 1 Lugar!',
            'R$129,90/mês. 0% de Comissão. Setup Grátis. Comece Agora!'
        ]
    });
}

module.exports = GoogleAdsManager;
```

---

## 4️⃣ Email Marketing Automation

**Objetivo:** Enviar sequências de email automáticas

### Pré-requisitos

```bash
npm install @sendgrid/mail nodemailer
```

### Script: `email-automation.js`

```javascript
// scripts/marketing/email-automation.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

class EmailAutomation {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        this.templates = this.loadTemplates();
    }

    loadTemplates() {
        return {
            welcome: {
                subject: '🎉 Bem-vindo ao ÓoDelivery, {name}!',
                html: (data) => `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Inter, sans-serif; }
                            .header { background: linear-gradient(135deg, #7C3AED, #6D28D9); padding: 40px; text-align: center; }
                            .logo { color: white; font-size: 32px; font-weight: bold; }
                            .content { padding: 40px; }
                            .cta { background: #7C3AED; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; }
                            .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
                            .feature { padding: 20px; background: #F3F4F6; border-radius: 8px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">🚀 ÓoDelivery</div>
                        </div>
                        <div class="content">
                            <h1>Olá, ${data.name}! 👋</h1>
                            <p>Seja bem-vindo ao ÓoDelivery!</p>
                            <p>A partir de agora, seu delivery está no caminho da automação completa.</p>
                            
                            <h2>🚀 O que você pode fazer agora:</h2>
                            <div class="features">
                                <div class="feature">
                                    <h3>1️⃣ Configurar cardápio</h3>
                                    <p>Crie seu cardápio digital em minutos</p>
                                </div>
                                <div class="feature">
                                    <h3>2️⃣ Ativar ÓoBot</h3>
                                    <p>WhatsApp automático 24/7</p>
                                </div>
                                <div class="feature">
                                    <h3>3️⃣ Cadastrar produtos</h3>
                                    <p>Adicione todos os seus produtos</p>
                                </div>
                                <div class="feature">
                                    <h3>4️⃣ Zonas de entrega</h3>
                                    <p>Configure suas áreas de entrega</p>
                                </div>
                            </div>
                            
                            <p style="text-align: center; margin: 40px 0;">
                                <a href="${data.setupUrl}" class="cta">Começar Setup</a>
                            </p>
                            
                            <p>🎁 <strong>Lembrete:</strong> Você tem 7 dias grátis!</p>
                            <p>Aproveite para testar todas as funcionalidades.</p>
                            
                            <hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">
                            <p style="color: #6B7280; font-size: 14px;">
                                Bom delivery! 🍕<br>
                                Equipe ÓoDelivery
                            </p>
                        </div>
                    </body>
                    </html>
                `
            },
            oobot: {
                subject: '🤖 Seu novo atendente trabalha 24/7',
                html: (data) => `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Inter, sans-serif; }
                            .header { background: linear-gradient(135deg, #3B82F6, #2563EB); padding: 40px; text-align: center; }
                            .content { padding: 40px; }
                            .cta { background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; }
                            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
                            .stat { text-align: center; padding: 20px; background: #EFF6FF; border-radius: 8px; }
                            .stat-number { font-size: 32px; font-weight: bold; color: #3B82F6; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">🤖 ÓoBot</div>
                        </div>
                        <div class="content">
                            <h1>${data.name},</h1>
                            <p>Conheça o ÓoBot — seu atendente automático do WhatsApp!</p>
                            
                            <p>Enquanto você lê este email, ele está:</p>
                            <ul>
                                <li>✅ Respondendo clientes</li>
                                <li>✅ Confirmando pedidos</li>
                                <li>✅ Atualizando status</li>
                                <li>✅ Enviando cardápios</li>
                            </ul>
                            
                            <div class="stats">
                                <div class="stat">
                                    <div class="stat-number">80%</div>
                                    <div>Menos tempo no WhatsApp</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-number">45%</div>
                                    <div>Mais vendas</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-number">95%</div>
                                    <div>Satisfação do cliente</div>
                                </div>
                            </div>
                            
                            <p style="text-align: center; margin: 40px 0;">
                                <a href="${data.oobotUrl}" class="cta">Ativar ÓoBot Agora</a>
                            </p>
                            
                            <hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">
                            <p style="color: #6B7280; font-size: 14px;">
                                Precisa de ajuda? Responda este email!<br>
                                Equipe ÓoDelivery
                            </p>
                        </div>
                    </body>
                    </html>
                `
            }
            // ... mais templates
        };
    }

    async sendWelcomeEmail(user) {
        const template = this.templates.welcome;
        
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: template.subject.replace('{name}', user.name),
            html: template.html({
                name: user.name,
                setupUrl: `${process.env.APP_URL}/setup`
            })
        };

        try {
            await sgMail.send(msg);
            console.log(`✅ Email de boas-vindas enviado para ${user.email}`);
        } catch (error) {
            console.error('❌ Erro ao enviar email:', error.message);
            throw error;
        }
    }

    async sendEmailSequence(user, sequenceName) {
        const sequences = {
            onboarding: [
                { day: 0, template: 'welcome' },
                { day: 2, template: 'oobot' },
                { day: 4, template: 'fidelidade' },
                { day: 5, template: 'zonas' },
                { day: 6, template: 'case' },
                { day: 7, template: 'ultima-chamada' }
            ]
        };

        const sequence = sequences[sequenceName];
        
        for (const step of sequence) {
            const sendDate = new Date();
            sendDate.setDate(sendDate.getDate() + step.day);
            
            // Agendar envio
            await this.scheduleEmail(user, step.template, sendDate);
        }
    }

    async scheduleEmail(user, templateName, sendDate) {
        // Salvar em fila de agendamento
        const queue = {
            userId: user.id,
            email: user.email,
            template: templateName,
            scheduledFor: sendDate,
            status: 'pending'
        };

        // Implementar lógica de agendamento (banco de dados, Redis, etc.)
        console.log(`⏰ Email ${templateName} agendado para ${sendDate}`);
    }

    async sendBulkEmail(recipients, templateName, customData = {}) {
        const template = this.templates[templateName];
        
        const batchSize = 100; // Limite do SendGrid
        const batches = Math.ceil(recipients.length / batchSize);

        for (let i = 0; i < batches; i++) {
            const batch = recipients.slice(i * batchSize, (i + 1) * batchSize);
            
            const msgs = batch.map(recipient => ({
                to: recipient.email,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: template.subject.replace('{name}', recipient.name),
                html: template.html({
                    name: recipient.name,
                    ...customData
                })
            }));

            await sgMail.sendMultiple(msgs);
            console.log(`✅ Lote ${i + 1}/${batches} enviado`);
            
            // Delay para não exceder rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async trackEmailMetrics() {
        // Implementar tracking de opens, clicks, etc.
        const metrics = await sgMail.request({
            method: 'GET',
            url: '/v3/emails/stats'
        });

        return metrics;
    }
}

module.exports = EmailAutomation;
```

---

## 5️⃣ Lead Scoring & Nurturing

**Objetivo:** Qualificar leads automaticamente

### Script: `lead-scoring.js`

```javascript
// scripts/marketing/lead-scoring.js
class LeadScorer {
    constructor() {
        this.scores = {
            // Comportamento no site
            visited_pricing: 10,
            visited_features: 5,
            visited_demo: 15,
            visited_case: 10,
            
            // Engajamento com email
            opened_email: 2,
            clicked_email: 5,
            
            // Interação com anúncios
            clicked_ad: 5,
            submitted_form: 50,
            
            // Dados demográficos
            restaurant_owner: 20,
            monthly_revenue_10k_30k: 10,
            monthly_revenue_30k_plus: 20,
            uses_ifood: 15,
            has_delivery: 10
        };

        this.thresholds = {
            cold: 0,
            warm: 30,
            hot: 60,
            ready: 80
        };
    }

    calculateScore(lead) {
        let score = 0;
        const activities = lead.activities || [];
        const profile = lead.profile || {};

        // Score por atividades
        activities.forEach(activity => {
            if (this.scores[activity.type]) {
                score += this.scores[activity.type];
            }
        });

        // Score por perfil
        if (profile.isRestaurantOwner) score += this.scores.restaurant_owner;
        if (profile.monthlyRevenue >= 30000) score += this.scores.monthly_revenue_30k_plus;
        else if (profile.monthlyRevenue >= 10000) score += this.scores.monthly_revenue_10k_30k;
        if (profile.usesIFood) score += this.scores.uses_ifood;
        if (profile.hasDelivery) score += this.scores.has_delivery;

        // Decay (envelhecimento do lead)
        const daysSinceLastActivity = this.getDaysSinceLastActivity(lead);
        if (daysSinceLastActivity > 7) {
            score *= 0.8; // -20%
        }
        if (daysSinceLastActivity > 30) {
            score *= 0.5; // -50%
        }

        return Math.floor(score);
    }

    getLeadStatus(score) {
        if (score >= this.thresholds.ready) return 'ready';
        if (score >= this.thresholds.hot) return 'hot';
        if (score >= this.thresholds.warm) return 'warm';
        return 'cold';
    }

    getNurturingAction(status) {
        const actions = {
            cold: {
                type: 'email',
                sequence: 'educational',
                frequency: 'weekly'
            },
            warm: {
                type: 'email',
                sequence: 'feature-focused',
                frequency: 'twice-weekly'
            },
            hot: {
                type: 'phone',
                action: 'sales-call',
                priority: 'high'
            },
            ready: {
                type: 'phone',
                action: 'close-deal',
                priority: 'urgent',
                offer: 'discount-50-percent'
            }
        };

        return actions[status];
    }

    async processLeads(leads) {
        const results = [];

        for (const lead of leads) {
            const score = this.calculateScore(lead);
            const status = this.getLeadStatus(score);
            const action = this.getNurturingAction(status);

            results.push({
                leadId: lead.id,
                score,
                status,
                action,
                processedAt: new Date()
            });

            // Disparar ação de nurturing
            await this.triggerNurturingAction(lead, action);
        }

        return results;
    }

    async triggerNurturingAction(lead, action) {
        switch (action.type) {
            case 'email':
                await this.sendNurturingEmail(lead, action.sequence);
                break;
            case 'phone':
                await this.createSalesTask(lead, action);
                break;
        }
    }

    async sendNurturingEmail(lead, sequence) {
        // Implementar envio de email
        console.log(`📧 Enviando email de nurturing para ${lead.email}`);
    }

    async createSalesTask(lead, action) {
        // Criar tarefa no CRM
        console.log(`📞 Criando tarefa de venda para ${lead.email} - Prioridade: ${action.priority}`);
    }

    getDaysSinceLastActivity(lead) {
        if (!lead.lastActivityAt) return 999;
        const now = new Date();
        const lastActivity = new Date(lead.lastActivityAt);
        return Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    }
}

module.exports = LeadScorer;
```

---

## 6️⃣ Social Media Scheduler

**Objetivo:** Agendar posts em múltiplas redes

### Script: `social-scheduler.js`

```javascript
// scripts/marketing/social-scheduler.js
const cron = require('node-cron');
const InstagramPoster = require('./instagram-poster');
const FacebookAdsManager = require('./facebook-ads-manager');

class SocialScheduler {
    constructor() {
        this.instagram = new InstagramPoster();
        this.facebook = new FacebookAdsManager();
        this.queue = [];
    }

    schedulePost(platform, content, scheduleTime) {
        this.queue.push({
            id: this.generateId(),
            platform,
            content,
            scheduledFor: new Date(scheduleTime),
            status: 'pending'
        });

        console.log(`✅ Post agendado para ${platform} às ${scheduleTime}`);
    }

    async processQueue() {
        const now = new Date();
        const duePosts = this.queue.filter(
            post => post.status === 'pending' && new Date(post.scheduledFor) <= now
        );

        for (const post of duePosts) {
            try {
                await this.publishPost(post);
                post.status = 'published';
            } catch (error) {
                console.error(`❌ Erro ao publicar post ${post.id}:`, error);
                post.status = 'failed';
            }
        }
    }

    async publishPost(post) {
        switch (post.platform) {
            case 'instagram':
                await this.instagram.postFeed(post.content.imagePath, post.content.caption);
                break;
            case 'facebook':
                await this.facebook.createPost(post.content);
                break;
            case 'linkedin':
                await this.publishLinkedIn(post.content);
                break;
        }

        console.log(`✅ Post ${post.id} publicado em ${post.platform}`);
    }

    startScheduler() {
        // Verificar fila a cada minuto
        cron.schedule('* * * * *', () => {
            this.processQueue();
        });

        console.log('🤖 Scheduler iniciado. Verificando fila a cada minuto.');
    }

    generateId() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async publishLinkedIn(content) {
        // Implementar LinkedIn API
        console.log('📊 Publicando no LinkedIn...');
    }
}

// Uso
const scheduler = new SocialScheduler();

// Agendar posts da semana
scheduler.schedulePost('instagram', {
    imagePath: '/design-assets/instagram/posts/post-01-lancamento.png',
    caption: '🚀 CHEGOU A REVOLUÇÃO DO DELIVERY!...'
}, '2026-03-01T10:00:00-03:00');

scheduler.schedulePost('facebook', {
    message: 'Post Facebook',
    link: 'https://oodelivery.com.br'
}, '2026-03-01T11:00:00-03:00');

// Iniciar scheduler
scheduler.startScheduler();

module.exports = SocialScheduler;
```

---

## 7️⃣ Analytics Dashboard

**Objetivo:** Consolidar métricas de todos os canais

### Script: `analytics-dashboard.js`

```javascript
// scripts/marketing/analytics-dashboard.js
class AnalyticsDashboard {
    constructor() {
        this.metrics = {
            instagram: {},
            facebook: {},
            google: {},
            email: {},
            website: {}
        };
    }

    async collectAllMetrics() {
        await Promise.all([
            this.collectInstagramMetrics(),
            this.collectFacebookMetrics(),
            this.collectGoogleMetrics(),
            this.collectEmailMetrics(),
            this.collectWebsiteMetrics()
        ]);
    }

    async collectInstagramMetrics() {
        // Implementar Instagram Graph API
        this.metrics.instagram = {
            followers: 1250,
            reach: 5000,
            impressions: 8000,
            engagement: 450,
            posts: 25
        };
    }

    async collectFacebookMetrics() {
        // Implementar Facebook Ads API
        this.metrics.facebook = {
            spend: 3000,
            impressions: 50000,
            clicks: 1500,
            conversions: 75,
            ctr: 0.03,
            cpc: 2.00
        };
    }

    async collectGoogleMetrics() {
        // Implementar Google Ads API
        this.metrics.google = {
            spend: 4000,
            impressions: 80000,
            clicks: 2400,
            conversions: 120,
            ctr: 0.03,
            cpc: 1.67
        };
    }

    async collectEmailMetrics() {
        // Implementar SendGrid API
        this.metrics.email = {
            sent: 5000,
            delivered: 4950,
            opened: 1237,
            clicked: 247,
            bounced: 50,
            unsubscribed: 10,
            openRate: 0.25,
            clickRate: 0.05
        };
    }

    async collectWebsiteMetrics() {
        // Implementar Google Analytics API
        this.metrics.website = {
            sessions: 10000,
            users: 7500,
            pageviews: 35000,
            bounceRate: 0.45,
            avgSessionDuration: 180,
            conversions: 150,
            conversionRate: 0.02
        };
    }

    generateReport() {
        const totalSpend = (this.metrics.facebook.spend || 0) + (this.metrics.google.spend || 0);
        const totalConversions = 
            (this.metrics.facebook.conversions || 0) +
            (this.metrics.google.conversions || 0) +
            (this.metrics.website.conversions || 0);

        return {
            period: 'Últimos 30 dias',
            generatedAt: new Date(),
            summary: {
                totalSpend: totalSpend,
                totalConversions: totalConversions,
                cac: totalSpend / totalConversions,
                roas: (totalConversions * 129.90) / totalSpend
            },
            channels: this.metrics
        };
    }

    async sendDailyReport(email) {
        await this.collectAllMetrics();
        const report = this.generateReport();

        // Enviar por email
        console.log('📊 Enviando relatório diário...');
        console.log(JSON.stringify(report, null, 2));
    }
}

module.exports = AnalyticsDashboard;
```

---

## 8️⃣ WhatsApp Broadcast

**Objetivo:** Enviar mensagens em massa para leads

### Script: `whatsapp-broadcast.js`

```javascript
// scripts/marketing/whatsapp-broadcast.js
const { create } = require('venom-bot');

class WhatsAppBroadcast {
    constructor() {
        this.client = null;
    }

    async initialize() {
        this.client = await create({
            session: 'oodelivery',
            headless: true
        });
    }

    async sendBroadcast(message, contacts) {
        const results = [];

        for (const contact of contacts) {
            try {
                const result = await this.client.sendText(
                    `${contact.phone}@c.us`,
                    this.formatMessage(message, contact)
                );

                results.push({
                    contact: contact.name,
                    success: true,
                    messageId: result.id
                });

                // Delay para não ser bloqueado
                await this.sleep(2000);
            } catch (error) {
                results.push({
                    contact: contact.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    formatMessage(template, contact) {
        return template
            .replace('{name}', contact.name)
            .replace('{link}', 'https://oodelivery.com.br/teste')
            .replace('{date}', new Date().toLocaleDateString('pt-BR'));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Uso
async function main() {
    const broadcast = new WhatsAppBroadcast();
    await broadcast.initialize();

    const message = `Olá, {name}! 👋

Sou do ÓoDelivery e tenho uma oferta especial pra você!

🎉 50% OFF no primeiro mês
De R$129,90 por R$64,95

Só até {date}!

👉 {link}

Abraço!`;

    const contacts = [
        { name: 'Ricardo', phone: '5511999999999' },
        { name: 'Juliana', phone: '5511988888888' }
    ];

    const results = await broadcast.sendBroadcast(message, contacts);
    console.log(results);
}

module.exports = WhatsAppBroadcast;
```

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd scripts/marketing
npm init -y
npm install instagram-private-api facebook-node-sdk google-ads-api @sendgrid/mail nodemailer node-cron venom-bot dotenv
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Executar Scripts

```bash
# Instagram
node instagram-poster.js

# Facebook Ads
node facebook-ads-manager.js

# Google Ads
node google-ads-manager.js

# Email
node email-automation.js

# Scheduler
node social-scheduler.js

# Analytics
node analytics-dashboard.js
```

### 4. Agendar com Cron (Linux/Mac)

```bash
crontab -e

# Postar no Instagram todo dia às 10:00
0 10 * * * cd /path/to/project && node instagram-poster.js

# Enviar relatório diário às 18:00
0 18 * * * cd /path/to/project && node analytics-dashboard.js
```

### 5. Agendar com Task Scheduler (Windows)

```powershell
# Criar tarefa agendada
$action = New-ScheduledTaskAction -Execute 'node' -Argument 'instagram-poster.js' -WorkingDirectory 'C:\path\to\project'
$trigger = New-ScheduledTaskTrigger -Daily -At 10:00AM
Register-ScheduledTask -TaskName 'ÓoDelivery Instagram Post' -Action $action -Trigger $trigger
```

---

## 📊 Monitoramento

### Logs

Todos os scripts devem logar em:
```
/logs/marketing/
├── instagram.log
├── facebook.log
├── google.log
├── email.log
└── analytics.log
```

### Alertas

Configurar alertas para:
- Campanhas pausadas automaticamente
- CAC acima do esperado
- Taxa de bounce de email > 5%
- Erros de autenticação

---

**Scripts criados em:** 26/02/2026  
**Última atualização:** 26/02/2026

*ÓoDelivery — Seu delivery no automático.* 🚀
