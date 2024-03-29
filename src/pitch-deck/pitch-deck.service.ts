import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { RowDataPacket } from 'mysql2/promise';

import { GeneratePitchDeckDto } from './dto/generate-pitch-deck.dto';
import { GetSummaryDto } from './dto/get-summary.dto';
import { SaveSummaryDto } from './dto/save-summary.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PitchDeckService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService,
  ){}

  async step1(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='A' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length == 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select 0 indicator, name from ag_country
        where id=
        (
        SELECT UQ.extravalue FROM ag_user_quest UQ, ag_user U
        WHERE 
        UQ.email=U.email
        and UQ.email=?
        and U.qversion=UQ.qversion
        and UQ.qnbr=1
        )
        union
        select country_indicator_id, country_indicator_value from ag_countries_ind where 
        country_id=
        (
        select alpha3 from ag_country
        where id=
        (
        SELECT UQ.extravalue FROM ag_user_quest UQ, ag_user U
        WHERE 
        UQ.email=U.email
        and UQ.email=?
        and U.qversion=UQ.qversion
        and UQ.qnbr=1
        )
        )
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);
  
      const find0 = query[0].find(data => data.indicator === 0);
      const find2 = query[0].find(data => data.indicator === 2);
      const find6 = query[0].find(data => data.indicator === 6);
      const find9 = query[0].find(data => data.indicator === 9);
      const find10 = query[0].find(data => data.indicator === 10);
      const find22 = query[0].find(data => data.indicator === 22);
      const find25 = query[0].find(data => data.indicator === 25);
      const find26 = query[0].find(data => data.indicator === 26);
      const find36 = query[0].find(data => data.indicator === 36);
      const find40 = query[0].find(data => data.indicator === 40);
      const find43 = query[0].find(data => data.indicator === 43);
      const find49 = query[0].find(data => data.indicator === 49);
      const find86 = query[0].find(data => data.indicator === 86);
      const find93 = query[0].find(data => data.indicator === 93);
      const find104 = query[0].find(data => data.indicator === 104);
      const find108 = query[0].find(data => data.indicator === 108);
      const find118 = query[0].find(data => data.indicator === 118);
      const find125 = query[0].find(data => data.indicator === 125);
      const find128 = query[0].find(data => data.indicator === 128);
      const find184 = query[0].find(data => data.indicator === 184);
      const find229 = query[0].find(data => data.indicator === 229);
      const find231 = query[0].find(data => data.indicator === 231);
      const find239 = query[0].find(data => data.indicator === 239);
      const find338 = query[0].find(data => data.indicator === 338);
      const find361 = query[0].find(data => data.indicator === 361);
      const find362 = query[0].find(data => data.indicator === 362);
      const find375 = query[0].find(data => data.indicator === 375);
      const find378 = query[0].find(data => data.indicator === 378);
      const find380 = query[0].find(data => data.indicator === 380);
      const find381 = query[0].find(data => data.indicator === 381);
      const find474 = query[0].find(data => data.indicator === 474);
      const find475 = query[0].find(data => data.indicator === 475);
      const find476 = query[0].find(data => data.indicator === 476);
      const find477 = query[0].find(data => data.indicator === 477);
      const find479 = query[0].find(data => data.indicator === 479);
      const find481 = query[0].find(data => data.indicator === 481);
      const find482 = query[0].find(data => data.indicator === 482);
      const find575 = query[0].find(data => data.indicator === 575);
      const find579 = query[0].find(data => data.indicator === 579);
      const find669 = query[0].find(data => data.indicator === 669);
      const find671 = query[0].find(data => data.indicator === 671);
      const find672 = query[0].find(data => data.indicator === 672);
      const find674 = query[0].find(data => data.indicator === 674);
      const find726 = query[0].find(data => data.indicator === 726);
      const find838 = query[0].find(data => data.indicator === 838);
      const find967 = query[0].find(data => data.indicator === 967);
  
      let content = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the following information concerning the Country Context and produce a comprehensive, professional report. This report will serve as a crucial component for creating a corporate PitchDeck. Your analysis should be presented in a narrative text format, devoid of any letter or slider-like presentation.';
  
      if (find0) {
        content += `In ${ find0.name }, the data reveals various economic and social factors without issuing judgments.`;
      }
  
      if (find2) {
        if (Number(find2.name) >= 2)
          content += `The economic growth rate is at ${ find2.name }%, means a positive economic growth.`;
        else if (Number(find2.name) <= 0)
          content += `The economic growth rate is at ${ find2.name }%, means challenges in economic growth.`;
        else
          content += `The economic growth rate is at ${ find2.name }%, means a stable economic growth.`;
      }
  
      if (find6) {
        if (Number(find6.name) >= 300)
          content += `The GDP is ${ find6.name } billion USD, means significant GDP.`;
        else
          content += `The GDP is ${ find6.name } billion USD, means decreasing GDP, reflecting economic challenges.`;
      }
  
      if (find9) {
        if (Number(find9.name) >= 50)
          content += `Government debt levels have risen to ${ find9.name }% of GDP.`;
        else
          content += `Government debt levels are manageable, ${ find9.name }% of GDP.`;
      }
  
      if (find10) {
        if (Number(find10.name) >= 5)
          content += `The unemployment rate increased to ${ find10.name }%, indicating a high unemployment rate.`;
        else
          content += `The unemployment rate decreased to ${ find10.name }%, indicating a low unemployment rate.`;
      }
  
      if (find22) {
        if (Number(find22.name) >= 5)
          content += `Foreign direct investment as a percentage of GDP, shows a ${ find22.name }%, reflecting significant foreign direct investment.`;
        else
          content += `Foreign direct investment as a percentage of GDP, shows a decline to ${ find22.name }%, reflecting reduced international capital inflow.`;
      }
  
      if (find0 && find25) {
        content += `The population of ${ find0.name } is ${ find25.name } million.`;
      }
  
      if (find26) {
        if (Number(find26.name) < 75)
          content += `Life expectancy has decreased to ${ find26.name } years, pointing to healthcare system issues.`;
        else
          content += `Life expectancy has increased to ${ find26.name } years, pointing to a good healthcare system.`;
      }
  
      if (find36) {
        if (Number(find36.name) >= 10)
          content += `Youth unemployment has surged to ${ find36.name }%, means elevated youth unemployment.`;
        else
          content += `Youth unemployment has surged to ${ find36.name }%, means low youth unemployment.`;
      }
  
      if (find40) {
        if (Number(find40.name) >= 60)
          content += `The degree of urbanization remains stagnant at ${ find40.name }%, describing significant urbanization.`;
        else
          content += `The degree of urbanization remains stagnant at ${ find40.name }%, describing limited urbanization.`;
      }
  
      if (find43) {
        if (Number(find43.name) >= 60)
          content += `Labor force participation has increased to ${ find43.name }%, indicating active labor force participation.`;
        else
          content += `Labor force participation has dropped to ${ find43.name }%, indicating reduced workforce engagement.`;
      }
  
      if (find49) {
        if (Number(find49.name) >= 30)
          content += `Government spending as a percentage of GDP has increased to ${ find49.name }%, raising fiscal concerns.`;
        else
          content += `Government spending as a percentage of GDP has increased to ${ find49.name }%, describing controlled government spending.`;
      }
  
      if (find86 && find93 && find104 && find108 && find0 && find118 && find125 && find128) {
        content += `Governance measures: The regulatory quality is ${ find86.name }%, The Overall globalization is ${ find93.name }%, the Human development is ${ find104.name }% and the Corruption perceptions - Transparency International is ${ find108.name }% ${ find0.name } also demonstrates an innovation index of ${ find118.name }, high-tech exports as a percentage of manufactured exports at ${ find125.name }%, and research and development expenditure to ${ find128.name }USD billion.`;
      }
  
      if (find229 && find231 && find239) {
        content += `Trade indicators, including exports at ${ find229.name } USD billion, imports at ${ find231.name } billion, and a trade balance ${ find239.name } USD billion.`;
      }
  
      if (find184) {
        if (Number(find184.name) >= 60)
          content += `Household consumption as a percentage of GDP has increased to ${ find184.name }, robust household consumption.`;
        else
          content += `Household consumption as a percentage of GDP has dropped to ${ find184.name }, reflecting reduced consumer-driven growth.`;
      }
  
      if (find338) {
        if (Number(find338.name) >= 10000)
          content += `GDP per capita in current dollars is ${ find338.name }, signaling relatively high GDP per capita.`;
        else
          content += `GDP per capita in current dollars is ${ find338.name }, signaling lower living standards.`;
      }
  
      content += `Other demographic and social fields: `;
  
      if (find361) {
        if (Number(find361.name) >= 6)
          content += `Happiness index ${ find361.name }, means high happiness.`;
        else
          content += `Happiness index ${ find361.name }, means low happiness.`;
      }
  
      if (find362) {
        content += `Labor force ${ find362.name }, `;
      }
  
      if (find375) {
        if (Number(find375.name) >= 40)
          content += `Rural population ${ find375.name }%, means higher rural population percentage.`;
        else
          content += `Rural population ${ find375.name }%, lower rural population percentage.`;
      }
  
      if (find378) {
        content += `Land area ${ find378.name }, `;
      }
  
      if (find380) {
        if (Number(find380.name) >= 30)
          content += `Children ${ find380.name }%, means higher percentage of children.`;
        else
          content += `Children ${ find380.name }%, means lower percentage of children.`;
      }
  
      if (find381) {
        if (Number(find381.name) >= 15)
          content += `Population ages 65 and above ${ find381.name }%, means higher percentage of elderly population.`;
        else
          content += `Population ages 65 and above ${ find381.name }%, means lower percentage of elderly population.`;
      }
  
      if (find0 && find474 && find475 && find476 && find477) {
        content += `Beyond economics, ${ find0.name } faces economic forecasts, including economic growth estimated at ${ find474.name }%, moderate inflation at ${ find475.name }%, declining investment ${ find476.name }, and an increasing unemployment rate at ${ find477.name }%.`;
      }
  
      if (find479) {
        content += `Additionally, the budget balance is projected to ${ find479.name }% of GDP.`;
      }
  
      if (find481 && find482) {
        content += `Governance measures, such as the rule of law is ${ find481.name } and government effectiveness is ${ find482.name }.`;
      }
  
      if (find575 && find579) {
        content += `The political stability is ${ find575.name } and competitiveness is ${ find579.name }.`;
      }
  
      if (find0 && find669) {
        content += `In addressing societal disparities, ${ find0.name } grapples with a Gini inequality index at ${ find669.name }`;
      }
  
      if (find671) {
        content += `The top 10 percent income share is at ${ find671.name }%.`;
      }
  
      if (find672 && find674) {
        content += `Poverty at 1.90 USD per day affects ${ find672.name } of the population, the poverty ratio has surged to ${ find674.name }%.`;
      }
  
      if (find726) {
        content += `Demographic factors like population growth remain at ${ find726.name }%.`;
      }
  
      if (find838) {
        content += `Fiscal balance as a percentage of GDP is at ${ find838.name }%.`;
      }
  
      if (find967) {
        content += `The cost of living has become ${ find967.name }%.`;
      }
  
      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';
  
      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'A');
  
      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step2(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='B' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
      select Q.qnbr, concat(group_concat(
        case 
        when Q.qnbr=2 then Q.extravalue
        when Q.qnbr=1 then (select C.name from ag_country C where C.id=convert(Q.extravalue,unsigned))
          else A1.descr 
      end 
        SEPARATOR ', ')) 
      as R3 from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (3,6,2,1,5)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
      UNION
      select 'CO', name 
      from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find1 = query[0].find(data => data.qnbr === '1');
      const find2 = query[0].find(data => data.qnbr === '2');
      const find3 = query[0].find(data => data.qnbr === '3');
      const find5 = query[0].find(data => data.qnbr === '5');
      const find6 = query[0].find(data => data.qnbr === '6');
      const findCO = query[0].find(data => data.qnbr === 'CO');

      let content = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the provided Company/Firm Profile information and create a detailed, professional narrative. This narrative will serve as a fundamental element for constructing a corporate PitchDeck. Please present your analysis in a text-based format, avoiding any letter-style or slider-like presentation.';

      if (find1 && find2 && find3 && find5 && find6 && findCO) {
        content += `${ findCO.R3 } is an ${ find3.R3 } operating in the ${ find6.R3 } area which was incorporated in ${ find2.R3 } in ${ find1.R3 } as a ${ find5.R3 }.`;
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'B');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step3(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='C' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.descr
        from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (21,22,24,23,29,46,7,42,45,49,43,51,54,55,50,53,47,48,58,65,64,12,13,14,18,10,11,17,111,113,114,115,116)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
        UNION
        select 1000, name 
        from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find7 = query[0].find(data => data.qnbr === 7);
      const find10 = query[0].find(data => data.qnbr === 10);
      const find11 = query[0].find(data => data.qnbr === 11);
      const find12 = query[0].find(data => data.qnbr === 12);
      const find13 = query[0].find(data => data.qnbr === 13);
      const find14 = query[0].find(data => data.qnbr === 14);
      const find17 = query[0].find(data => data.qnbr === 17);
      const find18 = query[0].find(data => data.qnbr === 18);
      const find21 = query[0].find(data => data.qnbr === 21);
      const find22 = query[0].find(data => data.qnbr === 22);
      const find23 = query[0].find(data => data.qnbr === 23);
      const find24 = query[0].find(data => data.qnbr === 24);
      const find29 = query[0].find(data => data.qnbr === 29);
      const find42 = query[0].find(data => data.qnbr === 42);
      const find43 = query[0].find(data => data.qnbr === 43);
      const find45 = query[0].find(data => data.qnbr === 45);
      const find46 = query[0].find(data => data.qnbr === 46);
      const find47 = query[0].find(data => data.qnbr === 47);
      const find48 = query[0].find(data => data.qnbr === 48);
      const find49 = query[0].find(data => data.qnbr === 49);
      const find50 = query[0].find(data => data.qnbr === 50);
      const find51 = query[0].find(data => data.qnbr === 51);
      const find53 = query[0].find(data => data.qnbr === 53);
      const find54 = query[0].find(data => data.qnbr === 54);
      const find55 = query[0].find(data => data.qnbr === 55);
      const find58 = query[0].find(data => data.qnbr === 58);
      const find64 = query[0].find(data => data.qnbr === 64);
      const find65 = query[0].find(data => data.qnbr === 65);
      const find111 = query[0].find(data => data.qnbr === 111);
      const find113 = query[0].find(data => data.qnbr === 113);
      const find114 = query[0].find(data => data.qnbr === 114);
      const find115 = query[0].find(data => data.qnbr === 115);
      const find116 = query[0].find(data => data.qnbr === 116);
      const findCO = query[0].find(data => data.qnbr === 1000);

      let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the provided Business Activities information and craft a detailed, professional narrative. This narrative will be a pivotal component in the creation of a corporate PitchDeck. Your response should be text-based, avoiding any letter-style or slider-like presentation formats. My company name is ${ findCO.descr }.`;

      if (find21 && find22) {
        content += `The company is ${ find21.descr } with ${ find22.descr } as target customers.`;
      }

      if (find24 && find23 && find29) {
        content += `The firm has ${ find24.descr } products in ${ find23.descr } with ${ find29.descr } sales in the domestic market.`;
      }

      if (find46) {
        content += `The capital is provided by ${ find46.descr } to get started.`;
      }

      if (find7) {
        content += `${ find7.descr } of the firm have the largest shareholding.`;
      }

      if (find42 && find45) {
        content += `The key management roles are ${ find42.descr } and are ${ find45.descr }.`;
      }

      if (find49 && find43) {
        content += `The senior management has ${ find49.descr } of experience and has ${ find43.descr }.`;
      }

      if (find51) {
        content += `The top manager has a ${ find51.descr }.`;
      }

      if (find54 && find55) {
        content += `There are ${ find54.descr } full-time employees and more than ${ find55.descr } temporary employees.`;
      }

      if (find50) {
        content += `Most of the workers have completed the ${ find50.descr }.`;
      }

      if (find53) {
        content += `${ find53.descr }, of the staff has special skills and education.`;
      }

      if (find47 && find48) {
        if (find47.descr.toLowerCase() === 'yes' && find48.descr.toLowerCase() === 'yes') {
          content += `There is a clear organizational chart and clear division of responsibilities between board of directors, senior management and staff.`;
        }
      }

      if (find58) {
        if (find58.descr.toLowerCase() === 'yes') {
          content += `The human resource strategy promotes employee development.`;
        }
      }

      if (find65) {
        content += `The human resource strategy promotes the compensation ranks ${ find65.descr } industry averages.`;
      }

      if (find64) {
        if (find64.descr.toLowerCase() === 'yes') {
          content += `There is a manual of procedures and operating methods including training policy for different department/services.`;
        }
      }

      if (find65) {
        content += `How does the compensation ranks ${ find65.descr } versus industry averages.`;
      }

      if (find12 && find13) {
        content += `The company ${ find12.descr } and relates primarily to the SDG on ${ find13.descr } It has fully integrated the SDGs when determining key business priorities.`;
      }

      if (find14) {
        if (find14.descr.toLowerCase() === 'yes') {
          content += `The company does not work in collaboration with public bodies and/or civil society organizations on impact issues.`;
        }
      }

      if (find18) {
        if (find18.descr.toLowerCase() === 'yes') {
          content += `The company includes information about your company on impact on and engagement with the SDGs as part of its regular reporting.`;
        }
      }

      if (find10) {
        content += `Women have ${ find10.descr } ownership in the company`;
        if (find11) {
          if (find11.descr.toLowerCase() === 'yes') {
            content += ` and they are part of the senior management/board of directors.`;
          } else {
            content += '.';
          }
        } else {
          content += '.';
        }
      }

      if (find17) {
        if (find17.descr.toLowerCase() === 'yes') {
          content += `The company also seeks clients view on the SDGs.`;
        }
      }

      if (find111) {
        if (find111.descr.toLowerCase() === 'yes') {
          content += `The company adheres to the principles of the United Nations Global Impact on human rights, labor, environment and anti-corruption.`;
        }
      }

      if (find113) {
        if (find113.descr.toLowerCase() === 'yes') {
          content += `There been no court cases, any strikes or other collective disputes related to labor issues in the last two years.`;
        }
      }

      if (find114 || find115 || find116) {
        content += `The enterprise is not involved or have impacts on `;
        if (find114 && find115 && find116 && find114.descr.toLowerCase() === 'yes' && find115.descr.toLowerCase() === 'yes' && find116.descr.toLowerCase() === 'yes') {
          content += `Land acquisition, expropriation, Critical habitats and Indigenous peoples.`;
        } else if (find114 && find115 && find114.descr.toLowerCase() === 'yes' && find115.descr.toLowerCase() === 'yes') {
          content += `Land acquisition, expropriation and Critical habitats.`;
        } else if (find114 && find116 && find114.descr.toLowerCase() === 'yes' && find116.descr.toLowerCase() === 'yes') {
          content += `Land acquisition, expropriation and Indigenous peoples.`;
        } else if (find115 && find116 && find115.descr.toLowerCase() === 'yes' && find116.descr.toLowerCase() === 'yes') {
          content += `Critical habitats and Indigenous peoples.`;
        } else if (find114 && find114.descr.toLowerCase() === 'yes') {
          content += `Land acquisition, expropriation.`;
        } else if (find115 && find115.descr.toLowerCase() === 'yes') {
          content += `Critical habitats.`;
        } else if (find116 && find116.descr.toLowerCase() === 'yes') {
          content += `Indigenous peoples.`;
        }
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'C');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step4(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='D' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.descr
        from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (33,34,35,39,41,31,107,105,81,26,78,25,79,80,38,32,36,37,92)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
        UNION
        select 1000, name 
        from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find25 = query[0].find(data => data.qnbr === 25);
      const find26 = query[0].find(data => data.qnbr === 26);
      const find31 = query[0].find(data => data.qnbr === 31);
      const find32 = query[0].find(data => data.qnbr === 32);
      const find33 = query[0].find(data => data.qnbr === 33);
      const find34 = query[0].find(data => data.qnbr === 34);
      const find35 = query[0].find(data => data.qnbr === 35);
      const find36 = query[0].find(data => data.qnbr === 36);
      const find37 = query[0].find(data => data.qnbr === 37);
      const find38 = query[0].find(data => data.qnbr === 38);
      const find39 = query[0].find(data => data.qnbr === 39);
      const find41 = query[0].find(data => data.qnbr === 41);
      const find78 = query[0].find(data => data.qnbr === 78);
      const find79 = query[0].find(data => data.qnbr === 79);
      const find80 = query[0].find(data => data.qnbr === 80);
      const find81 = query[0].find(data => data.qnbr === 81);
      const find92 = query[0].find(data => data.qnbr === 92);
      const find105 = query[0].find(data => data.qnbr === 105);
      const find107 = query[0].find(data => data.qnbr === 107);
      const findCO = query[0].find(data => data.qnbr === 1000);

      let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Examine the given information concerning Market Analysis and Business Strategy, and produce a comprehensive, professional narrative. This narrative will serve as a crucial component for building a corporate PitchDeck. Ensure that your response is presented strictly in a textual format, avoiding any letter-style or slider-based presentations. My company name is ${ findCO.descr }.`;

      if (find33) {
        content += `There are ${ find33.descr } competitors in the market`;
        if (find34 || find35) {
          content += `, including competition from the `;
          if (find34 && find35 && find34.descr.toLowerCase() === 'yes' && find35.descr.toLowerCase() === 'yes') {
            content += `foreign competitors and state competitors.`;
          } else if (find34 && find34.descr.toLowerCase() === 'yes') {
            content += `foreign competitors.`;
          } else if (find35 && find35.descr.toLowerCase() === 'yes') {
            content += `state competitors.`;
          }
        } else {
          content += '.';
        }
      }

      if (find39) {
        if (find39.descr.toLowerCase() === 'yes') {
          content += `There are specific costs, processes, or technologies that limit competitive entry into the market.`;
        }
      }

      if (find41 && find31) {
        content += `The barriers to entry for the company's target market can be described as ${ find41.descr }. The current cost, in % total first annual net earning of entry into the industry is ${ find31.descr }.`;
      }

      if (find107) {
        content += `The impact of the Political risk in the investment activity is ${ find107.descr }.`;
      }

      if (find105) {
        if (find105.descr.toLowerCase() === 'yes') {
          content += `There are heavy government regulations prevalent in the industry, or potential for such regulation.`;
        }
      }

      if (find81) {
        content += `The company has ${ find81.descr }.`;
      }

      if (find26) {
        if (find26.descr.toLowerCase() === 'yes') {
          content += `Experienced a significant improvement in turnover among its important customers in recent years.`;
        }
      }

      if (find78) {
        if (find78.descr.toLowerCase() === 'yes') {
          content += `The company has diversified base of customers and services.`;
        }
      }

      if (find25) {
        if (find25.descr.toLowerCase() === 'yes') {
          content += `There are intellectual property rights (e.g. Trademarks etc.) for the domain names and product names.`;
        }
      }

      if (find79) {
        if (find79.descr.toLowerCase() === 'yes') {
          content += `The location and facilities for the business are suitable.`;
        }
      }

      if (find80) {
        if (find80.descr.toLowerCase() === 'yes') {
          content += `The firm does not have a concentration risk in business line.`;
        }
      }

      if (find38) {
        content += `${ find38.descr }.`;
      }

      if (find32) {
        content += `${ find32.descr }.`;
      }

      if (find36) {
        content += `The business has ${ find36.descr } standing against its direct competition.`;
      }

      if (find37) {
        content += `The company's competitive strategy is supported by ${ find37.descr } compared to its competitors.`;
      }

      if (find92) {
        if (find92.descr.toLowerCase() === 'yes') {
          content += `Inventory and equipment is not a large component of asset value.`;
        } else {
          content += `Inventory and equipment is a large component of asset value.`;
        }
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'D');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step5(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='E' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.descr 
        from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (82,83,66,67,71,72,73,68,69,103,104,102)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
        UNION
        select 1000, name 
        from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find66 = query[0].find(data => data.qnbr === 66);
      const find67 = query[0].find(data => data.qnbr === 67);
      const find68 = query[0].find(data => data.qnbr === 68);
      const find69 = query[0].find(data => data.qnbr === 69);
      const find71 = query[0].find(data => data.qnbr === 71);
      const find72 = query[0].find(data => data.qnbr === 72);
      const find73 = query[0].find(data => data.qnbr === 73);
      const find82 = query[0].find(data => data.qnbr === 82);
      const find83 = query[0].find(data => data.qnbr === 83);
      const find102 = query[0].find(data => data.qnbr === 102);
      const find103 = query[0].find(data => data.qnbr === 103);
      const find104 = query[0].find(data => data.qnbr === 104);
      const findCO = query[0].find(data => data.qnbr === 1000);

      let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Evaluate the provided data pertaining to Business-Related Risks and craft a comprehensive, professional narrative. This narrative will play a pivotal role in the development of a corporate PitchDeck. Please ensure that your response strictly adheres to a textual format and refrains from adopting letter-style or slider-like presentations. My company name is ${ findCO.descr }.`;

      if (find82) {
        content += `The estimated maximum loss (in % total equity) due to net exposure in foreign currencies is less than ${ find82.descr }.`;
      }

      if (find83) {
        if (find83.descr.toLowerCase() === 'yes') {
          content += `The company uses derivatives products to cover its risks.`;
        }
      }

      if (find66) {
        if (find66.descr.toLowerCase() === 'yes') {
          content += `There is a strong culture of risk.`;
        }
      }

      if (find67) {
        if (find67.descr.toLowerCase() === 'yes') {
          content += `The company uses risk matrix is used to conduct business.`;
        }
      }

      if (find71) {
        if (find71.descr.toLowerCase() === 'yes') {
          content += `Risk profile and risk limits are set by senior management.`;
        }
      }

      if (find72) {
        if (find72.descr.toLowerCase() === 'yes') {
          content += `Chief Risk Officer (CRO)/Head of audit has been appointed.`;
        }
      }

      if (find73) {
        if (find73.descr.toLowerCase() === 'yes') {
          content += `The Company periodically reports on risk or audit.`;
        }
      }

      if (find68 && find69) {
        if (find68.descr.toLowerCase() === 'yes') {
          content += `The Financial Statements are audited with ${ find69.descr } in past 3 years.`;
        }
      }

      if (find103) {
        if (find103.descr.toLowerCase() === 'yes') {
          content += `The human resource compliance requirements are met.`;
        }
      }

      if (find104) {
        if (find104.descr.toLowerCase() === 'yes') {
          content += `There has been no casualty losses and losses are covered by insurance.`;
        } else {
          content += `There has been casualty losses and losses are covered by insurance.`;
        }
      }

      if (find102) {
        if (find104.descr.toLowerCase() === 'yes') {
          content += `There is no risk current or pending material litigation, including employees, customers, suppliers, government.`;
        } else {
          content += `There is risk current or pending material litigation, including employees, customers, suppliers, government.`;
        }
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'E');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step6(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='F' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.anbr, A1.descr, concat(substring_index(Q.extravalue,'|',1)," USD (", year(V.submitdate) - 3 ,")") as prev3, concat(substring_index(substring_index(Q.extravalue,'|',2),'|',-1), " USD (",year(V.submitdate) - 2,")") as prev2, concat(substring_index(Q.extravalue,'|',-1), " USD (",year(V.submitdate) - 1,")") as prev1
        from 
        ag_user U, ag_user_quest Q, ag_entans A1, ag_user_form_version V
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (75)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        and V.email=U.email
        and V.qversion = U.qversion
        group by Q.qnbr, A1.anbr
      `, [showNotificationDto.email]);

      const company = await conn.query(`
      select name from ag_entrepreneur where email=?
      `, [showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);
      
      if (query[0].length > 0) {
        let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the provided data concerning Past Financial Performance and produce a professional and detailed narrative. This narrative will be a crucial component in creating a corporate PitchDeck. Please present your analysis solely in a textual format, avoiding any letter-style or slider-like presentations. My company name is ${ company[0][0].name }.`;

        for (let i=0; i<query[0].length; i++) {
          content += `If you were to ask me the following ${ query[0][i].descr }, my response will be: ${ query[0][i].prev1 }, ${ query[0][i].prev2 }, ${ query[0][i].prev3 }.`;
        }

        const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';
    
        await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'F');

        return { content };
      }

      await this.databaseService.closeConnection(conn);

      return { content: '' };
    }
  }

  async step7(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='G' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.descr
        as R3 from ag_user U, ag_user_quest Q, ag_entans A1
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (136,61,62,135,118,117,121,120,122,123)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        group by Q.qnbr
        UNION
        select 1000, name 
        from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find61 = query[0].find(data => data.qnbr === 61);
      const find62 = query[0].find(data => data.qnbr === 62);
      const find117 = query[0].find(data => data.qnbr === 117);
      const find118 = query[0].find(data => data.qnbr === 118);
      const find120 = query[0].find(data => data.qnbr === 120);
      const find121 = query[0].find(data => data.qnbr === 121);
      const find122 = query[0].find(data => data.qnbr === 122);
      const find123 = query[0].find(data => data.qnbr === 123);
      const find135 = query[0].find(data => data.qnbr === 135);
      const find136 = query[0].find(data => data.qnbr === 136);
      const findCO = query[0].find(data => data.qnbr === 1000);

      let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the provided Project Information and create a professional, detailed narrative. This narrative will be a vital element in the development of a corporate PitchDeck. Please ensure that your response is presented exclusively in a textual format, avoiding any letter-style or slider-like presentations. My company name is ${ findCO.R3 }.`;

      if (find136) {
        content += `Innovation project that the company wants to develop in the future would ${ find136.R3 }.`;
      }

      if (find61) {
        if (find61.R3.toLowerCase() === 'yes') {
          content += `There are designated employees or services/departments in charge of Research and Development/Innovation.`;
        }
      }

      if (find62) {
        if (find62.R3.toLowerCase() === 'yes') {
          content += `A Research and development program aiming improve the quality of products is adequately funded.`;
        }
      }

      if (find135) {
        content += `The company is using ${ find135.R3 } for the development of future innovative products and processes.`;
      }

      if (find118) {
        content += `The industry outlook is ${ find118.R3 }.`;
      }

      if (find121 && find117) {
        if (find121.R3.toLowerCase() === 'yes' && find117.R3.toLowerCase() === 'yes') {
          content += `The business anticipate the projected sales and cost to increase however, the company plans to continue with its growth strategy.`;
        }
      }

      if (find120) {
        if (find120.R3.toLowerCase() === 'yes') {
          content += `The company considers its products and services will not be outmoded soon.`;
        }
      }

      if (find122) {
        if (find122.R3.toLowerCase() === 'yes') {
          content += `The brand is leveraged to enter new markets or to resist economic downturns.`;
        }
      }

      if (find123) {
        content += `The company intends to ${ find123.R3 } as part of its development stategy in terms of exports.`;
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'G');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step8(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='H' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, A1.anbr, A1.descr, concat(substring_index(Q.extravalue,'|',1)," USD (", year(V.submitdate) + 1 ,")") prev1, concat(substring_index(substring_index(Q.extravalue,'|',2),'|',-1), " USD (",year(V.submitdate) + 2,")") prev2, concat(substring_index(Q.extravalue,'|',-1), " USD (",year(V.submitdate) + 3,")")
        as prev3 from 
        ag_user U, ag_user_quest Q, ag_entans A1, ag_user_form_version V
        where U.email=?
        and U.email=Q.email
        and U.qversion=Q.qversion
        and Q.qnbr in (76)
        and A1.qnbr=Q.qnbr
        and A1.anbr=Q.anbr
        and A1.effdt=Q.qeffdt
        and V.email=U.email
        and V.qversion = U.qversion
        group by Q.qnbr, A1.anbr
      `, [showNotificationDto.email]);

      const company = await conn.query(`
        select name from ag_entrepreneur where email=?
      `, [showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      if (query[0].length > 0) {
        let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the given information pertaining to Future Projections and create a professional, detailed narrative. This narrative will serve as a critical component for constructing a corporate PitchDeck. Please present your analysis strictly in a textual format, avoiding any letter-style or slider-like presentations. My company name is ${ company[0][0].name }.`;

        for (let i=0; i<query[0].length; i++) {
          content += `If you were to ask me the following ${ query[0][i].descr }, my response will be: ${ query[0][i].prev1 }, ${ query[0][i].prev2 }, ${ query[0][i].prev3 }.`;
        }

        const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

        await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'H');

        return { content };
      }

      await this.databaseService.closeConnection(conn);

      return { content: '' };
    }
  }

  async step9(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='I' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select Q.qnbr, concat(group_concat(
          case 
          when Q.qnbr=144 then Q.extravalue
          when Q.qnbr=1 then (select C.name from ag_country C where C.id=convert(Q.extravalue,unsigned))
            else A1.descr 
        end 
          SEPARATOR ', ')) 
        as R3 from ag_user U, ag_user_quest Q, ag_entans A1
          where U.email=?
          and U.email=Q.email
          and U.qversion=Q.qversion
          and Q.qnbr in (144,142,145,143)
          and A1.qnbr=Q.qnbr
          and A1.anbr=Q.anbr
          and A1.effdt=Q.qeffdt
          group by Q.qnbr
        UNION
        select 1000, name 
        from ag_entrepreneur where email=?
      `, [showNotificationDto.email, showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      const find142 = query[0].find(data => data.qnbr === 142);
      const find143 = query[0].find(data => data.qnbr === 143);
      const find144 = query[0].find(data => data.qnbr === 144);
      const find145 = query[0].find(data => data.qnbr === 145);
      const findCO = query[0].find(data => data.qnbr === 1000);

      let content = `As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters. Analyze the provided information regarding the Funding Request and craft a professional, detailed narrative. This narrative will be instrumental in the creation of a corporate PitchDeck. Ensure that your response is presented in a purely textual format, without adopting any letter-style or slider-based presentations. My company name is ${ findCO.R3 }.`;

      if (find144 && find142 && find145) {
        content += `The company estimates its funding needs to amount in ${ find144.R3 } under the form of ${ find142.R3 } wihcih will be used ${ find145.R3 }.`;
      }

      if (find143) {
        content += `It is ${ find143.R3 } currently working with other investors on a round of funding.`;
      }

      const contentSystem = 'As an expert in Engineering Economics, your role involves utilizing advanced data analysis tools to present business ventures to potential investors. Your task is to create persuasive narratives that vividly showcase the substantial potential of these ventures, enabling companies to distinguish themselves in a competitive market. Your focus should be on appealing to investors by emphasizing the scalability, market demand, and revenue projections of each endeavor. Extract valuable insights on market trends, customer behaviors, and competitive benchmarks to weave a compelling story. While maintaining a professional tone, infuse a touch of freshness and friendliness into your communication. Please respond in plain text, refraining from using letter or slider formats, and ensure your response remains within 2000 characters.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'I');

      return { content };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step10(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='FPD' AND email=? and text <> ''`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select text from 
        (
        select 
        case
        when section='A' then concat("Country Context: ",text)
        when section='B' then concat("Company/Firm Profile: ",text)
        when section='C' then concat("Business Activities: ",text)
        when section='D' then concat("Market Analysis and Business Strategy: ",text)
        when section='E' then concat("Business Related Risk: ",text)
        when section='F' then concat("Past Financial Performance: ",text)
        when section='G' then concat("Project Information: ",text)
        when section='H' then concat("Future Proyections: ",text)
        when section='I' then concat("Funding Request: ",text)
        end text
        from ag_pitchdeck
        where email=?
        order by section
        ) A
        where text is not null
      `, [showNotificationDto.email]);

      const data = await conn.query(`
        select name, aboutus from ag_entrepreneur where email=?
      `, [showNotificationDto.email]);

      let content = `Certainly, as an entrepreneur with ${ data[0][0].name }, I request the creation of an informative document within a character limit of 10,000 to 14,000 characters. The document is intended for investors and should maintain a formal tone. It will serve as a presentation of my company, ${ data[0][0].aboutus }. The information to be analyzed includes:Country Context, Company Profile, Business Activities, Market Analysis and Business Strategy, Business Risks, Financial Performance, Project Information, Funding Request and others. Please provide a text-based narrative while avoiding any letter or slider-like formats. The data analysis is as follows:`;

      for (let i=0; i<query[0].length; i++) {
        content += query[0][i].text;
      }

      let contentSystem = 'As an expert in economics, produce a document outlining the company\'s presentation within a character limit of 10,000 to 14,000 characters. Ensure the content maintains a formal tone and is presented in English. Avoid any letter-style or slider-based formats, and focus on delivering the information in a text-based narrative.';

      const {
        respGPT,
        prompt_tokens,
        completion_tokens,
        total_tokens
      } = await this.gptOnly(contentSystem, content);

      contentSystem = 'As an expert in economics, produce a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats). Explain each category using a concise range of one to five points per category. Ensure your response is presented in a purely textual narrative format in English, without any letter-style or slider-based presentation.';

      const {
        respGPT: respGPT2,
        prompt_tokens: prompt_tokens2,
        completion_tokens: completion_tokens2,
        total_tokens: total_tokens2
      } = await this.gptOnly(contentSystem, content);

      await conn.query(`
        INSERT INTO ag_gpttokens VALUES(NULL,?,?,?,?,NOW(),'pitchdeck')
      `, [showNotificationDto.email, (Number(prompt_tokens) + Number(prompt_tokens2)), (Number(completion_tokens) + Number(completion_tokens2)), (Number(total_tokens) + Number(total_tokens2))]);

      const maxIndexResp = await conn.query('SELECT MAX(`index`) maxIndex FROM ag_gpttokens');
      const maxIndex = maxIndexResp[0][0].maxIndex;

      await conn.query(`
        DELETE FROM ag_pitchdeck WHERE email=? AND id=? AND section='FPD'
      `, [showNotificationDto.email, showNotificationDto.id]);

      await conn.query(`
        INSERT INTO ag_pitchdeck VALUES(?,?,?,?,?)
      `, [
        showNotificationDto.email,
        showNotificationDto.id,
        maxIndex,
        'FPD',
        `${ respGPT }
        
        ${ respGPT2 }`
      ]);

      await this.databaseService.closeConnection(conn);

      return { message: 'Pitch Deck Document completed' };
    }

    await this.databaseService.closeConnection(conn);
  }

  async step11(showNotificationDto: GeneratePitchDeckDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query<RowDataPacket[]>(`SELECT text FROM ag_pitchdeck WHERE section='SPD' AND email=?`, [showNotificationDto.email]);

    if (validate[0].length === 0) {
      const query = await conn.query<RowDataPacket[]>(`
        select text from ag_pitchdeck where email=? and section='FPD'
      `, [showNotificationDto.email]);

      await this.databaseService.closeConnection(conn);

      let content = `Generate a concise summary within a character limit of 1500 to 2000 characters, focusing on the key points from the text. Please ensure that your response is presented in a straightforward textual format, avoiding any letter-style or slider-based presentations. ${ query[0][0].text }`;

      const contentSystem = 'Generate a concise summary within a character limit of 1500 to 2000 characters, focusing on the key points from the text. Please ensure that your response is presented in a straightforward textual format, avoiding any letter-style or slider-based presentations.';

      await this.gpt(showNotificationDto.email, showNotificationDto.id, contentSystem, content, 'SPD');

      return { message: 'Summary Pitch Deck completed' };
    }

    await this.databaseService.closeConnection(conn);
  }

  async getPitchDeckDocument(getSummaryDto: GetSummaryDto) {
    const conn = await this.databaseService.getConnection();

    const query = await conn.query<RowDataPacket[]>(`
      select text from ag_pitchdeck where id=? and section='FPD'
    `, [getSummaryDto.id]);

    await this.databaseService.closeConnection(conn);

    if (query[0].length > 0) {
      return { response: 1, text: query[0][0].text };
    }

    return { response: 0, text: null };
  }

  async savePitchDeckDocument(saveSummaryDto: SaveSummaryDto) {
    const conn = await this.databaseService.getConnection();

    const validate = await conn.query(`
      SELECT COUNT(*) validate FROM ag_pitchdeck WHERE email=? AND id=? AND section='FPD'
    `, [saveSummaryDto.email, saveSummaryDto.id]);
    const validateRes = validate[0][0].validate;

    if (validateRes === 0) {
      await conn.query(`
        INSERT INTO ag_pitchdeck VALUES(?,?,0,'FPD',?)
      `, [saveSummaryDto.email, saveSummaryDto.id, saveSummaryDto.text]);
    } else {
      await conn.query(`
        UPDATE ag_pitchdeck SET text=? WHERE email=? AND id=? AND section='FPD'
      `, [saveSummaryDto.text, saveSummaryDto.email, saveSummaryDto.id]);
    }

    await this.databaseService.closeConnection(conn);

    return { message: 'Pitch Deck Document saved' };
  }

  async getSummary(getSummaryDto: GetSummaryDto) {
    const conn = await this.databaseService.getConnection();

    const query = await conn.query<RowDataPacket[]>(`
      select text from ag_pitchdeck where id=? and section='SPD'
    `, [getSummaryDto.id]);

    await this.databaseService.closeConnection(conn);

    if (query[0].length > 0) {
      return { response: 1, text: query[0][0].text };
    }

    return { response: 0, text: null };
  }

  async saveSummary(saveSummaryDto: SaveSummaryDto) {
    const conn = await this.databaseService.getConnection();

    await conn.query(`
      UPDATE ag_pitchdeck SET text=? WHERE email=? AND id=? AND section='SPD'
    `, [saveSummaryDto.text, saveSummaryDto.email, saveSummaryDto.id]);

    await this.databaseService.closeConnection(conn);

    return { message: 'Summary Pitch Deck saved' };
  }

  private async gpt(email: string, id: string, contentSystem: string, contentUser: string, section: string) {
    const { data } = await lastValueFrom(this.httpService.post(`https://servicesai.agora-sme.org/pitch-deck`, {
      contentSystem,
      contentUser
    }));

    const respGPT = data.data.choices[0].message.content;
    const prompt_tokens = data.data.usage.prompt_tokens;
    const completion_tokens = data.data.usage.completion_tokens;
    const total_tokens = data.data.usage.total_tokens;

    const conn = await this.databaseService.getConnection();

    await conn.query(`
      INSERT INTO ag_gpttokens VALUES(NULL,?,?,?,?,NOW(),'pitchdeck')
    `, [email, prompt_tokens, completion_tokens, total_tokens]);

    const maxIndexResp = await conn.query('SELECT MAX(`index`) maxIndex FROM ag_gpttokens');
    const maxIndex = maxIndexResp[0][0].maxIndex;

    await conn.query(`
      INSERT INTO ag_pitchdeck VALUES(?,?,?,?,?)
    `, [email, id, maxIndex, section, respGPT]);

    await this.databaseService.closeConnection(conn);
  }

  private async gptOnly(contentSystem: string, contentUser: string) {
    const { data } = await lastValueFrom(this.httpService.post(`https://servicesai.agora-sme.org/pitch-deck`, {
      contentSystem,
      contentUser
    }));

    const respGPT = data.data.choices[0].message.content;
    const prompt_tokens = data.data.usage.prompt_tokens;
    const completion_tokens = data.data.usage.completion_tokens;
    const total_tokens = data.data.usage.total_tokens;

    return { respGPT, prompt_tokens, completion_tokens, total_tokens };
  }
}
