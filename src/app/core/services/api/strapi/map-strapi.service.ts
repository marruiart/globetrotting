import { Destination } from 'src/app/core/models/destination.interface';
import { User } from 'src/app/core/models/user.interface';
import { MapService } from '../map.service';
import { StrapiArrayResponse, StrapiResponse } from 'src/app/core/models/strapi-interfaces/strapi-data';
import { StrapiDestination } from 'src/app/core/models/strapi-interfaces/strapi-destination';
import { StrapiMedia } from 'src/app/core/models/strapi-interfaces/strapi-media';
import { StrapiExtendedUser } from 'src/app/core/models/strapi-interfaces/strapi-user';

export class MapStrapiService extends MapService {

  constructor() {
    super();
  }

  private mapImage = (image: StrapiResponse<StrapiMedia> | undefined) => {
    if (image?.data) {
      return {
        id: image.data.id,
        url_small: image.data.attributes.formats.small.url,
        url_medium: image.data.attributes.formats.medium.url,
        url_large: image.data.attributes.formats.large.url,
        url_thumbnail: image.data.attributes.formats.thumbnail.url
      }
    } else {
      return undefined
    }
  }

  public mapDestination(res: StrapiResponse<StrapiDestination>): Destination {
    return {
      id: res.data.id,
      name: res.data.attributes.name,
      type: res.data.attributes.type,
      dimension: res.data.attributes.dimension,
      price: res.data.attributes.price,
      image: this.mapImage(res.data.attributes.image),
      description: res.data.attributes.description
    }
  }

  public mapDestinations(res: StrapiArrayResponse<StrapiDestination>): Destination[] {
    return Array.from(res.data)
      .reduce((prev: Destination[], data: { attributes: StrapiDestination, id: number }): Destination[] => {
        let _destination: Destination = {
          id: data.id,
          name: data.attributes.name,
          type: data.attributes.type,
          dimension: data.attributes.dimension,
          price: data.attributes.price,
          image: data.attributes.image ? this.mapImage(data.attributes.image) : undefined,
          description: data.attributes.description
        }
        prev.push(_destination);
        return prev;
      }, []);
  }

  public mapUser(res: StrapiResponse<StrapiExtendedUser>): User {
    return {
      id: res.data.id,
      avatar: res.data.attributes.avatar ? this.mapImage(res.data.attributes.avatar) : undefined,
      nickname: res.data.attributes.nickname,
      name: res.data.attributes.name,
      surname: res.data.attributes.surname,
      age: res.data.attributes.age,
      user_id: res.data.attributes.user_id,
    }
  }

  public mapUsers(res: StrapiArrayResponse<StrapiExtendedUser>): User[] {
    return Array.from(res.data)
      .reduce((prev: User[], data: { attributes: StrapiExtendedUser, id: number }): User[] => {
        let _user: User = {
          id: data.id,
          avatar: data.attributes.avatar ? this.mapImage(data.attributes.avatar) : undefined,
          nickname: data.attributes.nickname,
          name: data.attributes.name,
          surname: data.attributes.surname,
          age: data.attributes.age,
          user_id: data.attributes.user_id,
        }
        prev.push(_user);
        return prev;
      }, []);
  }


}
