import { Body, Controller, Get, Post, Put, Delete, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RulesEngineService } from './rules-engine.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rulesEngineService: RulesEngineService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('sites')
  getSites(@Headers('x-organization-id') orgId: string, @Headers('x-user-role') role?: string) {
    const isGlobalContext = orgId === '11111111-1111-1111-1111-111111111111';
    const filterOrgId = (role === 'SUPER_ADMIN' && isGlobalContext) ? undefined : orgId;
    return this.appService.getSites(filterOrgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations')
  getOrganizations() {
    return this.appService.getOrganizations();
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizations')
  createOrganization(@Body() orgData: any) {
    return this.appService.createOrganization(orgData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('organizations/:id')
  updateOrganization(@Param('id') id: string, @Body() orgData: any) {
    return this.appService.updateOrganization(id, orgData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('organizations/:id')
  deleteOrganization(@Param('id') id: string) {
    return this.appService.deleteOrganization(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites')
  createSite(@Headers('x-organization-id') orgId: string, @Body() siteData: any) {
    const finalOrgId = siteData.organizationId || orgId;
    return this.appService.createSite(siteData, finalOrgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('zones')
  createZone(@Body() zoneData: any) {
    if (!zoneData.siteId) {
      throw new Error("siteId is required to create a zone");
    }
    return this.appService.createZone(zoneData, zoneData.siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sensors')
  getSensors(@Headers('x-organization-id') orgId: string) {
    return this.appService.getSensors(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('gateways')
  getGateways(@Headers('x-organization-id') orgId: string) {
    return this.appService.getGateways(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('gateways')
  createGateway(@Body() gatewayData: any) {
    return this.appService.createGateway(gatewayData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readings')
  getReadings(@Query('limit') limit?: string, @Headers('x-organization-id') orgId?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.appService.getReadings(parsedLimit, orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('energy/global')
  getGlobalEnergy(@Headers('x-organization-id') orgId: string, @Query('siteId') siteId?: string) {
    return this.appService.getGlobalEnergy(orgId, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('temperature/average')
  getAverageTemperature(@Headers('x-organization-id') orgId: string, @Query('siteId') siteId?: string) {
    return this.appService.getAverageTemperature(orgId, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  getAlerts(@Headers('x-organization-id') orgId: string, @Query('siteId') siteId?: string) {
    return this.appService.getAlerts(orgId, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('energy/hvac-performance')
  getHvacPerformance(@Headers('x-organization-id') orgId: string, @Query('siteId') siteId?: string) {
    return this.appService.getHvacPerformance(orgId, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rules')
  getRules(@Headers('x-organization-id') orgId: string) {
    return this.rulesEngineService.getRules(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rules')
  createRule(@Headers('x-organization-id') orgId: string, @Body() ruleData: any) {
    return this.rulesEngineService.createRule({ ...ruleData, organizationId: orgId });
  }

  // IoT Webhook entrypoint (Secured or Unsecured depending on architecture, here we secure it for demo)
  @UseGuards(JwtAuthGuard)
  @Post('iot/webhook')
  processIotWebhook(@Body() webhookData: any) {
    return this.appService.processIotWebhook(webhookData);
  }
  @UseGuards(JwtAuthGuard)
  @Get('search')
  globalSearch(
    @Query('q') q: string,
    @Headers('x-organization-id') orgId: string,
    @Headers('x-user-role') role: string
  ) {
    return this.appService.globalSearch(q, orgId, role);
  }
}

