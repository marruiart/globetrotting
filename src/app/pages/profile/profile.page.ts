import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { lastValueFrom } from 'rxjs';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';
import { FormChanges } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { AdminAgentOrClientUser, User, UserCredentials } from 'src/app/core/models/globetrotting/user.interface';
import { UsersService } from 'src/app/core/services/api/users.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { FullName, getUserName } from 'src/app/core/utilities/utilities';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  private readonly COMPONENT = 'ProfilePage';
  public successUpdate: boolean = false
  public user: AdminAgentOrClientUser | null = null;
  public fullname: string = ""
  public avatar: string | null = null;

  @ViewChild('fileUpload') fileUpload: FileUpload | null = null

  constructor(
    private authFacade: AuthFacade,
    private firebaseSvc: FirebaseService,
    private subsSvc: SubscriptionsService,
    private userSvc: UsersService,
    private translate: CustomTranslateService,
    private messageService: MessageService
  ) {

    this.subsSvc.addSubscriptions(this.COMPONENT,
      this.authFacade.currentUser$.subscribe(user => {
        this.user = user;
        this.avatar = user?.avatar
        this.fullname = getUserName(user as FullName)
      })
    );
  }

  public async updateProfile(_user: User & UserCredentials & FormChanges | null) {
    if (_user?.user_id && _user.ext_id) {
      lastValueFrom(this.userSvc.updateUser(_user)).then(_ =>
        this.showConfirmDialog("profilePage.updateProfileConfirmation", "profilePage.updateProfileMessageSuccess")
      ).catch(err => console.error(err));
    } else {
      this.showConfirmDialog("profilePage.updateProfileError", "profilePage.updateProfileMessageError", false)
    }
  }


  public uploadImage(event: any) {
    if (this.user) {
      this.firebaseSvc.fileUpload(event, `${this.user.user_id}` ?? "image").then(url => {
        if (this.user && url) {
          lastValueFrom(this.userSvc.updateUserAvatar(`${this.user.user_id}`, url)).then(_ => {
            this.showConfirmDialog("profilePage.uploadImageConfirmation", "profilePage.uploadImageMessageSuccess");
            this.fileUpload?.clear();
          }).catch(_ => {
            this.showConfirmDialog("profilePage.uploadImageError", "profilePage.uploadImageMessageError", false);
            this.fileUpload?.clear();
          })
        }
      })
    }
  }

  private showConfirmDialog(summaryTranslateId: string, detailTranslateId: string, success: boolean = true) {

    lastValueFrom(this.translate.getTranslation(summaryTranslateId)).then(summary =>
      lastValueFrom(this.translate.getTranslation(detailTranslateId)).then(detail => {
        const severity = (success) ? 'success' : 'danger'
        this.messageService.add({ severity: severity, summary: summary, detail: detail })
      })
    )



  }

}
