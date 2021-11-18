// import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { Dialog } from '@capacitor/dialog';
// import { SQLiteService } from '../services/sqlite.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { PreviewAnyFile } from '@ionic-native/preview-any-file/ngx';
import { AlertController, isPlatform, ToastController } from '@ionic/angular';
// import write_blob from 'capacitor-blob-writer';
// https://devdactic.com/capacitor-file-explorer-ionic/
// import { writeFile } from "capacitor-blob-writer";

import { Http, HttpDownloadFileResult } from '@capacitor-community/http';
import { HttpClient } from '@angular/common/http';

import { take, catchError } from 'rxjs/operators';
import { BehaviorSubject, of, throwError } from 'rxjs';

// Http.addListener("progress", (e) => {
//   console.log(e.type);
//   console.log(e.url);
//   console.log(e.bytes + " / " + e.contentLength);
//   // this.msg = e.type + '\n' + e.url + '\n' + e.bytes + '\n' + e.contentLength;
// });

const APP_DIRECTORY = Directory.Documents;

@Component({
  selector: 'home-page',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  folderContent = [];
  currentFolder = '';
  copyFile = null;
  @ViewChild('filepicker') uploader: ElementRef;

  msg: string;
  msg$ = new BehaviorSubject<string>('');
  

  constructor(
    private readonly http: HttpClient,
    private route: ActivatedRoute, private alertCtrl: AlertController, private router: Router,
    private previewAnyFile: PreviewAnyFile, private toastCtrl: ToastController
  ) {
  }

  ngOnInit(): void {
    this.currentFolder = this.route.snapshot.paramMap.get('folder') || '';
    this.loadDocuments();
  }

  async ngAfterViewInit() {}
  ngOnDestroy(): void {}

  async downloadVideo() {
    try {

      const prg = await Http.addListener("progress", (e) => {
        // console.log(e.type);
        // console.log(e.url);
        // console.log(e.bytes + " / " + e.contentLength);
        this.msg = e.type + ' / ' + e.url + ' / ' + e.bytes + ' / ' + e.contentLength;
        this.msg$.next(e.type + ' / ' + e.url + ' / ' + e.bytes + ' / ' + e.contentLength);
      });
      
      const response: HttpDownloadFileResult = await Http.downloadFile({
        // url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        url: 'https://file.io/khPVvft0ziFw',
        filePath: 'cty.mbtiles',
        fileDirectory: APP_DIRECTORY,
        // Optional
        method: 'GET',
        progress: true,
      });

      // this.msg = response.path;
      this.msg$.next(response.path);

      // this.loadDocuments();

      await prg.remove();
    } catch (err) {
      this.msg = err;
    }
  }


  async loadDocuments() {
    const folderContent = await Filesystem.readdir({
      directory: APP_DIRECTORY,
      path: this.currentFolder
    });
 
    // The directory array is just strings
    // We add the information isFile to make life easier
    this.folderContent = folderContent.files.map(file => {
      return {
        name: file,
        isFile: file.includes('.')
      }
    });
  }

  async createFolder() {
    let alert = await this.alertCtrl.create({
      header: 'Create folder',
      message: 'Please specify the name of the new folder',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'MyDir'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: async data => {
            await Filesystem.mkdir({
              directory: APP_DIRECTORY,
              path: `${this.currentFolder}/${data.name}`
            });
            this.loadDocuments();
          }
        }
      ]
    });
 
    await alert.present();
  }



  addFile() {
    this.uploader.nativeElement.click();
  }
 
  async fileSelected($event) {
    const selected = $event.target.files[0];
 
    // await write_blob({
    //   directory: APP_DIRECTORY,
    //   path: `${this.currentFolder}/${selected.name}`,
    //   blob: selected,
    //   on_fallback(error) {
    //     console.error('error: ', error);
    //   }
    // });
 
    this.loadDocuments();
  }
 
  async itemClicked(entry) {
    if (this.copyFile) {
      // We can only copy to a folder
      if (entry.isFile) {
        let toast = await this.toastCtrl.create({
          message: 'Please select a folder for your operation'
        });
        await toast.present();
        return;
      }
      // Finish the ongoing operation
      this.finishCopyFile(entry);
 
    } else {
      // Open the file or folder
      if (entry.isFile) {
        this.openFile(entry);
      } else {
        let pathToOpen =
          this.currentFolder != '' ? this.currentFolder + '/' + entry.name : entry.name;
        let folder = encodeURIComponent(pathToOpen);
        this.router.navigateByUrl(`/home/${folder}`);
      }
    }
  }
 
  async openFile(entry) {
    if (isPlatform('hybrid')) {
      // Get the URI and use our Cordova plugin for preview
      const file_uri = await Filesystem.getUri({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name
      });
 
      this.previewAnyFile.preview(file_uri.uri)
        .then((res: any) => console.log(res))
        .catch((error: any) => console.error(error));
    } else {
      // Browser fallback to download the file
      const file = await Filesystem.readFile({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name
      });
 
      const blob = this.b64toBlob(file.data, '');
      const blobUrl = URL.createObjectURL(blob);
 
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = blobUrl;
      a.download = entry.name;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    }
  }

  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
 
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
 
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
 
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
 
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
 
  async delete(entry) {
    if (entry.isFile) {
      await Filesystem.deleteFile({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name
      });
    } else {
      await Filesystem.rmdir({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name,
        recursive: true // Removes all files as well!
      });
    }
    this.loadDocuments();
  }
 
  startCopy(file) {
    this.copyFile = file;
  }
 
  async finishCopyFile(entry) {
    // Make sure we don't have any additional slash in our path
    const current = this.currentFolder != '' ? `/${this.currentFolder}` : ''
 
    const from_uri = await Filesystem.getUri({
      directory: APP_DIRECTORY,
      path: `${current}/${this.copyFile.name}`
    });
 
    const dest_uri = await Filesystem.getUri({
      directory: APP_DIRECTORY,
      path: `${current}/${entry.name}/${this.copyFile.name}`
    });
 
    await Filesystem.copy({
      from: from_uri.uri,
      to: dest_uri.uri
    });
    this.copyFile = null;
    this.loadDocuments();
  }


}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onabort = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  })
}

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader;
  reader.onerror = reject;
  reader.onload = () => {
    resolve(reader.result);
  };
 reader.readAsDataURL(blob);
});
