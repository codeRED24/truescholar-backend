import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserDevice } from "./user-device.entity";

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private readonly userDeviceRepository: Repository<UserDevice>
  ) {}

  async registerDevice(userId: string, token: string, deviceType: string = "web") {
    // Check if token already exists
    const existingDevice = await this.userDeviceRepository.findOne({ where: { token } });

    if (existingDevice) {
      // Always update to refresh the updatedAt timestamp (per Firebase best practices)
      // Also update userId in case token was transferred to different user
      existingDevice.userId = userId;
      existingDevice.deviceType = deviceType;
      return this.userDeviceRepository.save(existingDevice);
    }

    // Create new device
    const newDevice = this.userDeviceRepository.create({
      userId,
      token,
      deviceType,
    });

    return this.userDeviceRepository.save(newDevice);
  }

  async removeDevice(userId: string, token: string) {
    return this.userDeviceRepository.delete({ userId, token });
  }

  async getUserTokens(userId: string): Promise<string[]> {
    const devices = await this.userDeviceRepository.find({ where: { userId } });
    return devices.map((d) => d.token);
  }

  async removeInvalidTokens(tokens: string[]) {
    if (tokens.length === 0) return;
    await this.userDeviceRepository.delete(tokens.map(token => ({ token })));
  }
}
