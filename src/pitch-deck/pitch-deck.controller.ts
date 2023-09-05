import { Controller, Post, Body } from '@nestjs/common';
import { PitchDeckService } from './pitch-deck.service';
import { GeneratePitchDeckDto } from './dto/generate-pitch-deck.dto';

@Controller('pitch-deck')
export class PitchDeckController {
  constructor(private readonly pitchDeckService: PitchDeckService) {}

  @Post('step-1')
  step1(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step1(showNotificationDto);
  }

  @Post('step-2')
  step2(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step2(showNotificationDto);
  }

  @Post('step-3')
  step3(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step3(showNotificationDto);
  }

  @Post('step-4')
  step4(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step4(showNotificationDto);
  }

  @Post('step-5')
  step5(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step5(showNotificationDto);
  }

  @Post('step-6')
  step6(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step6(showNotificationDto);
  }

  @Post('step-7')
  step7(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step7(showNotificationDto);
  }

  @Post('step-8')
  step8(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step8(showNotificationDto);
  }

  @Post('step-9')
  step9(@Body() showNotificationDto: GeneratePitchDeckDto) {
    return this.pitchDeckService.step9(showNotificationDto);
  }
}
