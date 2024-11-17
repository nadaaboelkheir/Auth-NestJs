import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class LocationService {
  /**
   * Get the location of the user based on latitude and longitude.
   *
   * @param {CreateUserDto} { latitude, longitude } - The coordinates of the user
   * @returns {Promise<{ city: string; country: string }>} - The city and country of the user
   * @throws Will throw an error if the location cannot be determined or if the API fails
   */
  async getLocation({
    latitude,
    longitude,
  }: CreateUserDto): Promise<{ city: string; country: string }> {
    const providerUrl = 'http://api.openweathermap.org/data/2.5/weather';
    const appid = '708df00807f71713104cfe8ac6898bb3'; 
    const url = `${providerUrl}?lat=${latitude}&lon=${longitude}&appid=${appid}`;

    try {
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`API request failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (!data || !data.name || !data.sys?.country) {
        throw new Error('Location not found or API response is invalid');
      }

      return { city: data.name, country: data.sys.country };
    } catch (error) {
      throw new Error(`Error fetching location data: ${error.message}`);
    }
  }
}
