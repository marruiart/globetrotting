import { MappingService } from '../mapping.service';
import { StrapiArrayResponse, StrapiData, StrapiPayload, StrapiResponse } from 'src/app/core/models/strapi-interfaces/strapi-data';
import { StrapiDestination } from 'src/app/core/models/strapi-interfaces/strapi-destination';
import { StrapiMedia } from 'src/app/core/models/strapi-interfaces/strapi-media';
import { StrapiExtendedUser } from 'src/app/core/models/strapi-interfaces/strapi-user';
import { Destination, NewDestination, PaginatedDestination } from 'src/app/core/models/globetrotting/destination.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { Media } from 'src/app/core/models/globetrotting/media';

export class MapStrapiService extends MappingService {

  constructor() {
    super();
  }

  private mapDestinationData(data: StrapiData<StrapiDestination>): Destination {
    return {
      id: data.id,
      name: data.attributes.name,
      type: data.attributes.type,
      dimension: data.attributes.dimension,
      price: data.attributes.price,
      image: data.attributes.image ? this.mapImage(data.attributes.image) : undefined,
      description: data.attributes.description
    }
  }

  public override mapDestination = (res: StrapiResponse<StrapiDestination>): Destination => this.mapDestinationData(res.data);

  public override mapDestinations = (res: StrapiArrayResponse<StrapiDestination>): PaginatedDestination => {
    return {
      data: JSON.parse(JSON.stringify(res.data))
        .reduce((prev: Destination[], data: StrapiData<StrapiDestination>): Destination[] => {
          let _destination = this.mapDestinationData(data);
          prev.push(_destination);
          return prev;
        }, []),
      pagination: {
        page: res.meta.pagination.page,
        pageSize: res.meta.pagination.pageSize,
        pageCount: res.meta.pagination.pageCount,
        total: res.meta.pagination.total
      }
    }
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

  protected mapImage(res: StrapiResponse<StrapiMedia> | undefined): Media | undefined {
    if (res?.data) {
      return {
        id: res.data.id,
        url_small: res.data.attributes.formats.small.url,
        url_medium: res.data.attributes.formats.medium.url,
        url_large: res.data.attributes.formats.large.url,
        url_thumbnail: res.data.attributes.formats.thumbnail.url
      }
    } else {
      return undefined
    }
  }

  // Map to API

  public mapDestinationPayload(destination: NewDestination): StrapiPayload<StrapiDestination> {
    let strapiDestination: StrapiPayload<StrapiDestination> = {
      data: {
        name: destination.name,
        type: destination.type,
        dimension: destination.dimension,
        price: destination.price,
        image: undefined,
        description: destination.description
      }
    }
    return strapiDestination;
  }

}
