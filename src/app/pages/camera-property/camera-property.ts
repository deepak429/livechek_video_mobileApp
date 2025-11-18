import { Reports } from "./../../providers/reports";
import { InsuranceCompany } from "../../providers/insurance-company";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { NavController, NavParams, ViewController, AlertController, Platform, ToastController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { File } from "@ionic-native/file";
import { Diagnostic } from "@ionic-native/diagnostic";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { Flashlight } from "@ionic-native/flashlight";
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from "@ionic-native/camera-preview";
import { FileDog } from "../../providers/file-dog";
import { DeviceOrientationTracker } from "../../providers/device-orientation-tracker";
import { LocationTracker } from "../../providers/location-tracker";
import { DeviceMotionTracker } from "../../providers/device-motion-tracker";
import { AndroidFullScreen } from "@ionic-native/android-full-screen";
import { Stepcounter } from "@ionic-native/stepcounter";
import { AppConfig } from "../../providers/app-config";
import { AuthPage } from "../auth/auth";
import { SgssPage } from "../sgss/sgss";
import { FormPage } from "../form/form";
import { RatingPage } from "../rating/rating";
import { ObdPage } from "../obd/obd";
import { FormPropertyPage } from "../form-property/form-property";
import { FinalPage } from "../final/final";
import { VocalStatementPage } from "../vocal-statement/vocal-statement";
import { WorkshopsListPage } from "../workshops-list/workshops-list";
import { UndertakingSignaturePage } from "../undertaking-signature/undertaking-signature";
import { HomePage } from "../home/home";
import { MediaProvider } from "../../providers/media-provider";
import { Seed } from "../../providers/seeds";
import { VideoPage } from "../video/video";
import { isActivatable } from "ionic-angular/tap-click/tap-click";
import { NativeStorage } from "@ionic-native/native-storage";
import { FilePath } from "@ionic-native/file-path";
import { normalizeURL } from "ionic-angular";
import { setupConfig } from "ionic-angular/config/config";
import * as RecordRTC from "recordrtc";
import { VideoCapturePlus, VideoCapturePlusOptions } from '@ionic-native/video-capture-plus';

declare var cordova: any;
declare var cv;
@Component({
  selector: "page-camera-property",
  templateUrl: "camera-property.html",
})
export class CameraPropertyPage {
  @ViewChild('canvas')
  public canvas: ElementRef;
  public uniqueImgTypes = [];
  public selectedImgTypes = '';
  public picture: any;
  public stensile: any;
  private videoPath: string;
  public preview: any;
  public picNo= 0;
  public lastmedia = '';
  public comments = '';
  public impact: any;
  public impactCheckButtom: any;
  public docs: any;
  public user: any;
  public videoName: any;
  public navigatorStarted = false;
  public show = false;
  public flash = false;
  videoURL: any;
  fullPath: any;
  public recordTime = {
    minutes: 0,
    seconds: 0,
  };
  public timerId = null;
  public miniProcess:any;
  public falseAudioStream = null;
  public seconds = 0;
  public direction = 0;
  public nextState = "";
  public totalfields = 0;
  public sections = {};
  public lightIntensity: boolean;
  public height: any;
  public sectionNo: any;
  public fieldNo: any;
  public width: any;
  public stream: any;
  public usingMediaCapture = false;
  public type: any;
  public workshopInputs: any;
  public hiddenRecordingStopped = false;
  public mSensor = { x: 0, y: 0, z: 0, magnitude: 0 };
  public possibleStates = {
    RatingPage: RatingPage,
    SgssPage: SgssPage,
    ObdPage: ObdPage,
    FinalPage: FinalPage,
    FormPage: FormPage,
    WorkshopsListPage: WorkshopsListPage,
    VocalStatementPage: VocalStatementPage,
    UndertakingSignaturePage: UndertakingSignaturePage,
    HomePage: HomePage,
    VideoPage: VideoPage,
    FormPropertyPage: FormPropertyPage,
  };
  public filePathHidden = "";
  public fileNameHidden = "";
  public record = null;
  public videoStarted = false;
  public recordStarted = false;
  public recordStopped = false;
  public Voptions = {
    type: "video",
    mimeType: 'video/webm',
  };
  public recordingHidden = {
    seconds: 0,
    enabled: false,
    done: false,
  };
  myVideo: HTMLMediaElement;
  constructor(
    public reports: Reports,
    public navCtrl: NavController,
    public navParams: NavParams,
    private file: File,
    private filePath: FilePath,
    private cameraPreview: CameraPreview,
    private statusBar: StatusBar,
    private fileDog: FileDog,
    private viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public seed: Seed,
    private flashlight: Flashlight,
    private deviceMotionTracker: DeviceMotionTracker,
    private locationTracker: LocationTracker,
    private deviceOrientationTracker: DeviceOrientationTracker,
    private stepcounter: Stepcounter,
    private platform: Platform,
    private fullScreen: AndroidFullScreen,
    public mediaProvider: MediaProvider,
    private appConfig: AppConfig,
    public toastCtrl: ToastController,
    private openNativeSettings: OpenNativeSettings,
    private diagnostic: Diagnostic,
    private nativeStorage: NativeStorage,
    private elRef: ElementRef,
    private capturePlus: VideoCapturePlus,
  ) {
    this.user = navParams.get("user");
    console.log(navParams,"parameters passed",navParams.get("picNo"),"pic",navParams.get("state"),"state",navParams.get("section"),"secyio",
      navParams.get("field"),"fiels" );
    // if (!this.user) { this.navCtrl.push(AuthPage);}
    if (navParams.get("state")) { this.nextState = navParams.get("state"); }
    if (navParams.get("field")) { this.fieldNo = navParams.get("field"); }
    if (navParams.get("section")) { this.sectionNo = navParams.get("section"); }
    if (navParams.get("type")) { this.type = navParams.get("type"); }
    if (navParams.get("miniProcess")) { this.miniProcess = navParams.get("miniProcess"); }
    
    this.fileDog.reports = this.reports;
    this.fileDog.user = this.user;
    this.reports.fileCount = 0;
    this.deviceMotionTracker.currentStepCount = 0;

    this.locationTracker.startTracking(this.user.appType, this.user.mobile);

    console.log("insider csp");
    if (!this.user) { this.navCtrl.push(AuthPage); } 
    else {
      if(this.nextState.length > 1){
        this.docs = [this.miniProcess];
        this.uniqueImgTypes.push(this.miniProcess.imageType);
        this.sections[this.miniProcess.imageType] = [this.miniProcess]
        this.lightIntensity = this.docs[0].lightIntensity && this.docs[0].lightIntensity.value ? this.docs[0].lightIntensity.value : false;
        if (this.lightIntensity) this.checkLightIntensity();
        this.show = true;
        this.proceed(0);
      } else {
        this.impact = 0;
        var index = this.reports.process.cameraStates.findIndex( (o) => o.type == "images" );
        if(index >= 0){
          this.totalfields = this.reports.process.cameraStates[index].data.length;
          this.reports.process.cameraStates[index].data.forEach(field => {
            let fInd = this.uniqueImgTypes.findIndex(o=> o == field.imageType);
            if(fInd < 0){ this.uniqueImgTypes.push(field.imageType);this.sections[field.imageType] = [field]}
            else this.sections[field.imageType].push(field);
          });
          if(this.uniqueImgTypes.length <= 1){
            this.show = true;
            this.proceed(0);
          }
        } else {
          alert("Not Valid Process");
          this.navCtrl.push(HomePage);
        }
        this.docs = this.reports.process.cameraStates[index].data;
        this.lightIntensity = this.docs[this.picNo].lightIntensity && this.docs[this.picNo].lightIntensity.value ? this.docs[this.picNo].lightIntensity.value : false;
        if (this.lightIntensity) this.checkLightIntensity();
      }
      console.log("===> this.docs ",this.uniqueImgTypes, "this.picNo=====>", this.sections);
      this.statusBar.hide();
      this.nextClicked = false;
      this.preview = false;
    }
    
  }

  ionViewWillEnter() {
    this.startMedia();
    this.user.currentPage = "CameraStencilsPage";
    console.log(this.user, "yeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    this.height = window.screen.width;
    this.width = window.screen.height ;
    // this.afterSetUp();
    this.fullScreen.isImmersiveModeSupported().then(() => {
      this.fullScreen.immersiveMode();
      let width1 = this.fullScreen.immersiveWidth();
      let height1 = this.fullScreen.immersiveHeight();
      this.height = width1 > height1 ? height1 : width1;
      this.width = width1 > height1 ? width1 : height1;
    }).catch((error) => {
      console.error(error);
      this.height = window.screen.width;
      this.width = window.screen.height ;
    });
    console.log(this.height, this.width);
  }
  startMedia() {
    try {
      if(!this.usingMediaCapture){
        var navigaotr = <any>navigator;
        // this.myVideo = this.elRef.nativeElement.querySelector("video");
        let constraints = {
          audio: true,
          video: {
            facingMode: { exact: "environment" },
            frameRate: { min:16, ideal: 24, max: 60 },
            width: { min:800, ideal: 1024, max: 3200 },
            height: { min:650, ideal: 720, max: 3200 }
          },
        };
        if(this.nextState.length > 1){
          navigaotr.mediaDevices.getUserMedia({audio:true, video: false}).then(str=>{
            this.falseAudioStream = str;
          })
        }
        if (navigaotr.mediaDevices) {
          var t = this;
          console.log(navigaotr.mediaDevices.enumerateDevices(),"inside device");
          navigaotr.mediaDevices.getUserMedia(constraints).then((res) => {
            this.stream = res;
            console.log(res);   
            this.navigatorStarted = true;       
          }, (err) => {
            console.log("error in geting constraints ", err);
            navigaotr.mediaDevices.getUserMedia({audio: true, video: {facingMode: { exact: "environment" }}}).then((res) => {
              this.stream = res;
              this.navigatorStarted = true;  
              console.log(res);
            }, (err) => {
              console.log("error in geting constraints ", err);
              navigaotr.getUserMedia = navigaotr.getUserMedia || navigaotr.webkitGetUserMedia || navigaotr.mozGetUserMedia || navigaotr.msGetUserMedia;
              console.log("navigaotr.getUserMedia ", navigaotr.getUserMedia);
              navigaotr.getUserMedia(constraints, function (res) {
                t.stream = res;
                console.log(res);
                var track = res.getVideoTracks();
                if(track[0].label.indexOf("front") >= 0 && res != null){
                  res.getAudioTracks().forEach((track) => track.stop());
                  res.getVideoTracks().forEach((track) => track.stop());
                  t.stream = null;
                  t.usingMediaCapture = true;
                } else  t.navigatorStarted = true;  
              }, function (err) {
                console.log("error in geting meida ", err);
                t.usingMediaCapture = true;
              });
            }).catch((e) => {
              console.log("error in geting media. Now trynig with 'navigaotr.getUserMedia' ", e);
              var t = this;
              navigaotr.getUserMedia = navigaotr.getUserMedia || navigaotr.webkitGetUserMedia || navigaotr.mozGetUserMedia || navigaotr.msGetUserMedia;
              console.log("navigaotr.getUserMedia ", navigaotr.getUserMedia);
              navigaotr.getUserMedia(constraints, function (res) {
                t.stream = res;
                console.log(res);
                var track = res.getVideoTracks();
                if(track[0].label.indexOf("front") >= 0 && res != null){
                  res.getAudioTracks().forEach((track) => track.stop());
                  res.getVideoTracks().forEach((track) => track.stop());
                  t.stream = null;
                  t.usingMediaCapture = true;
                } else  t.navigatorStarted = true; 
              }, function (err) {
                t.usingMediaCapture = true;
                console.log("error in geting meida ", err);
              });
            });
          }).catch((e) => {
            console.log("error in geting media. Now trynig with 'navigaotr.getUserMedia' ", e);
            var t = this;
            navigaotr.getUserMedia = navigaotr.getUserMedia || navigaotr.webkitGetUserMedia || navigaotr.mozGetUserMedia || navigaotr.msGetUserMedia;
            console.log("navigaotr.getUserMedia ", navigaotr.getUserMedia);
            navigaotr.getUserMedia(constraints, function (res) {
              t.stream = res;
              console.log(res);
              var track = res.getVideoTracks();
              if(track[0].label.indexOf("front") >= 0 && res != null){
                res.getAudioTracks().forEach((track) => track.stop());
                res.getVideoTracks().forEach((track) => track.stop());
                t.stream = null;
                t.usingMediaCapture = true;
              } else t.navigatorStarted = true; 
            }, function (err) {
              t.usingMediaCapture = true;
              console.log("error in geting meida ", err);
            });
          });
        } else {
          console.log(navigaotr.enumerateDevices());
          var t = this; // 
          navigaotr.getUserMedia = navigaotr.getUserMedia || navigaotr.webkitGetUserMedia || navigaotr.mozGetUserMedia || navigaotr.msGetUserMedia;
          navigaotr.getUserMedia(constraints, function (stream) {
            t.stream = stream;
            console.log(stream);
            var track = stream.getVideoTracks();
            if(track[0].label.indexOf("front") >= 0 && stream != null){
              stream.getAudioTracks().forEach((track) => track.stop());
              stream.getVideoTracks().forEach((track) => track.stop());
              t.stream = null;
              t.usingMediaCapture = true;
            } else t.navigatorStarted = true; 
          }, function (err) {
            t.usingMediaCapture = true;
            console.log("The following error occurred: " + err.name, err); 
          });
        }
      } else {
        this.usingMediaCapture = true;
      }
    } catch (e) {
      this.usingMediaCapture = true;
      console.log("error in cancel", e);
    }
  }
  setup(){
    this.show = true;
    this.afterSetUp();
    
  }
  proceed(index){
    this.selectedImgTypes = this.uniqueImgTypes[index];
    this.show = true;
    this.nextClicked = false;
    this.preview = false;
    this.lastmedia = '';
    this.comments = '';
    this.videoStarted = false;
    this.recordStarted = false;
    this.recordStopped = false;
    if(this.usingMediaCapture){
      this.afterSetUp();
    }
    else {
      if(this.navigatorStarted && this.stream != null ) {
        this.setup();
        
        try {
          this.myVideo = (<HTMLMediaElement>document.getElementById("video"));// this.elRef.nativeElement.querySelector("video");
          this.myVideo.srcObject = this.stream;
          this.myVideo.muted = true;
        } catch (error) {
          console.log(error);
          setTimeout(() => {
            this.proceed(index);
          }, 1000);
        }
      } else {
        // this.user.presentToaster("Please wait");
        setTimeout(() => {
          this.proceed(index);
        }, 1000); 
      }
    }
  }
  afterSetUp() {
    this.startCamera();
    this.takeAgain();
    setInterval(() => {
      (<any>window).cordova.plugins.magnetometer.getReading(
        (data) => (this.mSensor = data),
        (error) => console.log(JSON.stringify(error))
      );
      this.update();
    }, 1000);
  }

  goBack() {
    if (this.navParams.get("state")) {
      if(this.falseAudioStream != null){
        this.falseAudioStream.getAudioTracks().forEach((track) => track.stop());
        this.falseAudioStream = null;
      }
      if (this.reports.inProcessUploading) {
        this.navCtrl.push(this.possibleStates[this.nextState], {user: this.user}).then(() => {
          const index = this.viewCtrl.index;
          this.navCtrl.remove(index);
          this.reports.inProcessUploading = false;
          this.reports.inProcessUploadData = [];
        });
      } else {
        this.navCtrl.push(this.possibleStates[this.nextState], {
          user: this.user,
          section: this.sectionNo,
          field: this.fieldNo,
          type: this.type,
        }).then(() => {
          const index = this.viewCtrl.index;
          this.navCtrl.remove(index);
        });
      }
    } else {
      this.show = false;
    }
  }
  public buttonClicked = false;
  goToState(i) {
    console.log("new pic no", i);
    if (i == 0) {
      for (var j = 1; j < this.reports.localFiles.length; j++) {
        this.fileDog.removeFile(this.reports.localFiles[i].location, this.reports.localFiles[i].filename);
      }
      for (var k = 1; k < this.reports.fileUploadMonitor.length; k++) {
        this.reports.fileUploadMonitor.splice(k, 1);
      }
      for (var l = 1; l < this.reports.reportImg.length; l++) {
        this.reports.reportImg.splice(l, 1);
      }
      this.reports.imageTypeTaken = [];
      this.reports.fileNames = [];
      this.reports.fileCount = 1;
    } else {
      var fileIndex = this.reports.reportImg.findIndex((o) => o.filename.split("_")[0] == this.docs[i].imageStencil);
      var fileUpIndex = this.reports.fileUploadMonitor.findIndex((o) => o.filename.split("_")[0] == this.docs[i].imageStencil);
      if (fileIndex >= 0) {
        console.log("previous data", this.reports.reportImg);
        this.reports.reportImg.splice(fileIndex, 1);
        console.log("new data", this.reports.reportImg);
      }
      if (fileUpIndex >= 0) {
        console.log("previous data upload", this.reports.reportImg);
        this.fileDog.removeFile(this.reports.fileUploadMonitor[fileUpIndex].location, this.reports.fileUploadMonitor[fileUpIndex].filename);
        this.reports.fileUploadMonitor.splice(fileUpIndex, 1);
        console.log("new data upload", this.reports.reportImg);
      }
      let fileNameI = this.reports.fileNames.findIndex((o) => o.fileName.split("_")[0] == this.docs[i].imageStencil);
      if (fileNameI >= 0) {
        this.reports.fileNames.splice(fileNameI, 1);
      }
      this.reports.fileCount--;
    }
    this.preview = false;
    this.options = false;
    this.buttonClicked = false;
    this.picNo = i;
    if (this.docs[this.picNo].quality) this.appConfig.pictureOpts.quality = 1 * this.docs[this.picNo].quality;

    setTimeout(() => { this.takeAgain(); }, 1000);
  }
  takeScreenShots() {
    var context = this.canvas.nativeElement.getContext("2d").drawImage(this.myVideo, 0, 0, 640, 480);

    console.log(this.canvas.nativeElement.toDataURL("image/png"), "hghjh")
    var blob = this.dataURItoBlob(this.canvas.nativeElement.toDataURL("image/png"));

    var t = Math.floor((Math.random() * 100) + 1);
    var d = new Date();
    var n = d.getTime();
  
  }
  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });

  }
  close() {
    this.alertCtrl.create({
      title: "Do you want to close this inspection ?",
      buttons: [
        {
          text: "No",
          role: "cancel",
          handler: () => { console.log("Cancel clicked"); },
        },
        {
          text: "Yes",
          handler: () => {
            console.log("Impact confirmed");
            this.cameraPreview.stopCamera().then((succes) => {
              this.user.camera = false;
              console.log("camera got closed successfully", succes);
            }).catch((err) => {
              console.log("Issue in closing camera", JSON.stringify(err));
            });
            if (this.navParams.get("state")) {
              if(this.falseAudioStream != null){
                this.falseAudioStream.getAudioTracks().forEach((track) => track.stop());
                this.falseAudioStream = null;
              }
              if (this.reports.inProcessUploading) {
                this.navCtrl.push(this.possibleStates[this.nextState], {user: this.user}).then(() => {
                  const index = this.viewCtrl.index;
                  this.navCtrl.remove(index);
                  this.reports.inProcessUploading = false;
                  this.reports.inProcessUploadData = [];
                });
              } else {
                this.navCtrl.push(this.possibleStates[this.nextState], {
                  user: this.user,
                  section: this.sectionNo,
                  field: this.fieldNo,
                  type: this.type,
                }).then(() => {
                  const index = this.viewCtrl.index;
                  this.navCtrl.remove(index);
                });
              }
            }
            else {
              this.nextState = this.reports.appConfig.states.auth;
              if (!this.hiddenRecordingStopped) this.stopHiddenRecording();
              this.fileDog.removeFiles(this.reports.localFiles);
              this.reports.clearData();
              this.nativeStorage.remove("inProcess").then(() => {});
              this.nativeStorage.remove("startTime").then(() => {});
              this.navCtrl.push(this.possibleStates[this.nextState], { user: this.user }).then(() => {
                this.reports.picNoCSP = 0;
                const index = this.viewCtrl.index;
                this.navCtrl.remove(index);
              });
              this.options = false;
            }
          },
        },
      ],
    }).present();
  }
  public options = false;
  restart() {
    this.goToState(0);
  }
  stopHiddenRecording() {
    try {
      this.recordingHidden.enabled = false;
      this.recordingHidden.done = true;
      this.hiddenRecordingStopped = true;
      let index = this.reports.fileUploadMonitor.findIndex((o) => o.filename.split(".")[1] == "3gp");
      if (index < 0 && !this.reports.inProcessUploading) {
        this.mediaProvider.stopRe();
        console.log("Recording stopped");
        setTimeout(() => {
          this.saveHiddenRecording();
        }, 2000);
      }
    } catch (error) {
      console.log("Hidden Recording stop", error);
    }
    
  }
  startHiddenRecording() {
    if (!this.recordingHidden.enabled) {
      console.log("Inside startHiddenRecording ---->");
      // this.mediaProvider.createMedia(this.fileNameHidden);
      this.mediaProvider.startMedia(this.fileNameHidden);
      this.recordingHidden.enabled = true;
      console.log("Hidden Recording started");
    }
  }
  
  saveHiddenRecording() {
    this.locationTracker.getCurrentLocation();
    this.stepcounter.getHistory().then((historyObj) => {
        console.log("stepcounter-history success", historyObj);
        this.stepCount = JSON.stringify(historyObj);
      }, (onFailure) => console.log("stepcounter-history error", onFailure)
    );
    console.log("default location -----------------", this.filePathHidden);
    var sensorData = {
      gps: this.locationTracker.getString(),
      magnatormeter: "",
      orientation: this.deviceOrientationTracker.getString(),
      motion: this.deviceMotionTracker.currentStepCount,
      stepCount: this.stepCount,
    };
    if (!this.reports.inProcessUploading) {
      this.reports.updateReport(
        {
          location: {
            lat: this.locationTracker.lat,
            lng: this.locationTracker.lng,
          },
        },
        "location",
        this.reports,
        "green"
      ).then((result) => {
          console.log(result, "result in next state");
        }, (err) => {
          console.log("error in update report", err);
        }
      );
      var d = new Date();
      this.reports.fileCount++;
      let index = this.reports.fileUploadMonitor.findIndex( (o) => o.filename.split(".")[1] == "3gp");
      if (index < 0) {
        this.reports.fileUploadMonitor.push({
          location: this.filePathHidden,
          filename: this.fileNameHidden,
          sensorData: {},
          d: d,
          timestamp: new Date(),
          i: this.reports.fileUploadMonitor.length,
          status: "s",
        });
      }
      this.fileDog.uploadDrirect( this.user, this.reports, this.filePathHidden, this.fileNameHidden, sensorData, d, "green" );
      this.reports.updateFiles("hidden-recording", this.reports, "green");
    }
  }
  ionViewDidLoad() {
    this.platform.ready().then(() => {
      if (!this.platform.is("cordova")) {
        return false;
      }
      if (this.platform.is("ios")) {
        this.user.platform = "ios";
        this.fileNameHidden = "hidden_audio_" + this.reports.id + ".m4a";
      } 
      else {
        this.user.platform = "android";
        this.fileNameHidden = "hidden_audio_" + this.reports.id + ".3gp";
      }
      this.filePathHidden = normalizeURL(cordova.file.applicationStorageDirectory);
      this.checkReocrding();
    });
    setTimeout(() => {
      if(this.user.cameraPermission && this.user.micPermission && this.user.filePermission){
        console.log('permissions');
      } else {
        // alert("Please open phone permission manager and allow all required permissions otherwise you will be logged out.");
        this.user.verifyPer();
      }
    }, 2000);
  }
  private cameraStatus = false;
  checkReocrding() {
    let index = this.reports.fileUploadMonitor.findIndex((o) => o.filename.split(".")[1] == "3gp");
    if (index < 0 && !this.reports.inProcessUploading && !(this.nextState != null && this.nextState != undefined && this.nextState.length > 1)) {
      this.startHiddenRecording();
    }
  }
  startCamera() {
    if (this.usingMediaCapture) {
      this.cameraPreview.startCamera(this.appConfig.cameraPreviewOpts).then((res) => {
        this.user.camera = true;
        console.log("camera started-->>", res);
      }, (err) => {
        console.log("camera started-->>", err);
        if(err.indexOf('already started') >= 0){
          this.user.camera = true;
        }
        else {
          this.reloadCamera();
        }
        /*it show try to reload the view,*/ console.log("camera --->", err);
      }).catch(() => {
        this.startCamera();
      });
    }
  }
  reloadCamera (){
    this.cameraPreview.stopCamera();
    this.user.camera = false;
    this.startCamera();
  }
  public stepCount: any;
  public imageData: any;
  public vinRes: any;
  public impactCount = 0;
  public impactTaken = 0;
  public allImpactNo = 0;
  public showMoreDamage = false;
  public impactSide = [];
  public impactProcessStartIndex = 0;
  async takePicture() {
    this.checkLocation().then(async (r) => {
      if (r) {
        this.lastmedia = 'img';
        this.lightIntensity = this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].lightIntensity && this.docs[this.picNo].lightIntensity.value ? this.docs[this.picNo].lightIntensity.value : false;
        if (this.lightIntensity) this.checkLightIntensity();
        let cpo = [];
        var message;
        if (this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].orientation) {
          cpo = this.docs[this.picNo].orientation.split(",");
          cpo[0] *= 1;
          cpo[1] *= 1;
          cpo[2] *= 1;
          if (cpo[0] > 0 && cpo[0] >= this.deviceMotionTracker.data.x) {
            this.orientationError = true;
            message = this.docs[this.picNo].orientationMessage ? this.docs[this.picNo].orientationMessage : "Please rotate your phone and hold it in landscape mode";
            alert(message);
            return false;
          } else if (cpo[1] > 0 && cpo[1] >= this.deviceMotionTracker.data.y) {
            this.orientationError = true;
            message = this.docs[this.picNo].orientationMessage ? this.docs[this.picNo].orientationMessage : "Please rotate your phone and hold it in portrait mode";
            alert(message);
            return false;
          } else if (cpo[2] > 0 && cpo[2] >= this.deviceMotionTracker.data.z) {
            this.orientationError = true;
            message = this.docs[this.picNo].orientationMessage ? this.docs[this.picNo].orientationMessage : "Please rotate your phone and hold it in facing ground";
            alert(message);
            return false;
          }
        }
        this.locationTracker.getCurrentLocation();
        this.stepcounter.getHistory().then((historyObj) => {
            console.log("stepcounter-history success", JSON.stringify(historyObj));
            this.stepCount = JSON.stringify(historyObj);
          },(onFailure) => console.log("stepcounter-history error", onFailure)
        );
        try {
          if(!this.usingMediaCapture){
            var context =  this.elRef.nativeElement.querySelector('canvas');
            var ctx = context.getContext("2d").drawImage(this.myVideo, 0, 0, 720, 720);

            console.log(context.toDataURL("image/png"), "hghjh")
          //var blob = this.dataURItoBlob(this.canvas.nativeElement.toDataURL("image/png"));
          // this.cameraPreview.takePicture(this.appConfig.pictureOpts).then((imgData) => {
            this.picture = context.toDataURL("image/png");
            this.imageData = this.picture.split(';base64,')[1];
            this.preview = true;
            this.data = new Date();
            // let checkBlur = this.docs[this.picNo].detectBlur && !this.docs[this.picNo].detectBlur.value ? this.docs[this.picNo].detectBlur.value : true;
            // let meanStdDev = this.docs[this.picNo].detectBlur && this.docs[this.picNo].detectBlur.meanStdDev ? this.docs[this.picNo].detectBlur.meanStdDev : 10;
            // if (checkBlur) await this.checkBlur(this.picture, meanStdDev);
            try {
              setTimeout(() => {
                (<HTMLInputElement>document.getElementById("previewPicture")).src = this.picture;
              }, 300);
            } catch (error) {
              console.log(error);
            }
            let img = this.elRef.nativeElement.querySelector("previewPicture");
            console.log(img,this.preview);
          } else {
            this.cameraPreview.takePicture(this.appConfig.pictureOpts).then((imgData) => {
              this.picture = "data:image/jpeg;base64," + imgData;
              this.imageData = imgData;
              this.preview = true;
              this.data = new Date();
              // let checkBlur = this.docs[this.picNo].detectBlur && !this.docs[this.picNo].detectBlur.value ? this.docs[this.picNo].detectBlur.value : true;
              // let meanStdDev = this.docs[this.picNo].detectBlur && this.docs[this.picNo].detectBlur.meanStdDev ? this.docs[this.picNo].detectBlur.meanStdDev : 10;
              // if (checkBlur) this.checkBlur(this.picture, meanStdDev);

              try {
                setTimeout(() => {
                  (<HTMLInputElement>document.getElementById("previewPicture")).src = this.picture;
                }, 300);
              } catch (error) {
                console.log(error);
              }
            },(err) => {
              console.log(err);
              this.takeAgain();
            });
          }
          // img.src = this.picture
        } catch (error) {
          console.log(error);
          //this.preview = false;
          this.takeAgain();
          //(<HTMLInputElement>document.getElementById("rotate90")).src = this.stensile[this.picNo].loc;
        }
        // }, (err) => {
        //   
        // });
      } else return;
    });
  }
  takeVideo() {
    this.checkLocation().then((r) => {
      if (r) {
        this.data = new Date();
        this.lastmedia = 'vid';
        this.locationTracker.getCurrentLocation();
        this.stepcounter.getHistory().then((historyObj) => {
            console.log("stepcounter-history success", JSON.stringify(historyObj));
            this.stepCount = JSON.stringify(historyObj);
          },(onFailure) => console.log("stepcounter-history error", onFailure)
        );
        if(!this.usingMediaCapture){
          try {
            this.record = RecordRTC(this.stream, this.options);
            console.log(this.record);
            this.seconds = 0;
            this.timer();
            this.record.startRecording();
            this.recordStarted = true;
          } catch (error) {
            this.usingMediaCapture = true;
            this.takeVideo();
          }
        } 
        else {
          this.capturePlus.captureVideo({
            limit: 1,
          }).then((videoFiles) => {
            console.log(videoFiles, "videos");
            this.preview = true;
            this.videoStarted = false;
            this.recordStopped = true;
            this.videoName = videoFiles[0].name;
            this.videoURL = videoFiles[0]["fullPath"];
            this.fullPath = videoFiles[0]["fullPath"];
          }, (err) => {
            console.log( "Video error Captured", JSON.stringify(err));
            alert("Problem in recording video.\nPlease contact the admin");
          }).catch((err) => {
            console.log( "Video Could Not be Captured", JSON.stringify(err));
            alert( "Problem in recording video.\nPlease contact the admin\nJSON.stringify(err)");
              //console.log("Video Could Not be Captured",JSON.stringify(err));
          });
        }
      } else return;
    });
  }
  stopRecording() {
    if (!this.recordStopped) {
      try {
        this.recordStopped = true;
        this.record.stopRecording(this.processVideo.bind(this));
        clearTimeout(this.timerId);
        //this.nextPage();
      } catch (error) {
        console.log("error in cancel", error);
        setTimeout(() => {
          this.stopRecording();
        }, 100);
        
      }
    }
  }
  async processVideo(audioVideoWebMURL) {
    try {
      setTimeout(async() => {
        var recordedBlob = await this.record.getBlob();
        console.log(recordedBlob);
        this.videoURL = this.fileDog.location;
        let t = Date.now()
        this.videoName = this.selectedImgTypes+'_'+this.picNo+'_'+t+"_"+this.reports.id+".mp4";
        this.videoName = this.videoName.replace(/\s/g, "_")
        // this.record.getDataURL((dataURL) => {
        // var blob = new Blob([recordedBlob], { type: "video/webm" }); ;
        // console.log(blob);
        this.file.writeFile(this.fileDog.location, this.videoName, recordedBlob, {replace: true}).then((res: any) => {
          console.log("DONE WRITING",this.fileDog.location,this.videoName);
          this.fullPath = normalizeURL(this.fileDog.location + this.videoName).replace(/file:\/\//g, "");
          console.log(this.fullPath);
          this.videoStarted = false;
          this.preview = true;
          setTimeout(() => {
            try {
              let vid = (<HTMLMediaElement>document.getElementById("previewVid"));
              vid.src = this.fullPath;
              vid.load();
              // vid.play();
            } catch (error) {
              console.log("previesr", error)
            }
          }, 300);
        },(error) => {
          console.error(this.file.applicationStorageDirectory + JSON.stringify(error) + "Error while saving video");
        });
      }, 500);
      
      // });
    } catch (error) {
      console.log("error in cancel", error);
      setTimeout(() => {
        this.stopRecording();
      }, 100);
    }
  }
  lStepCount = 0;
  lDirection = 0;
  orientation = "";
  orientationError = false;
  update() {
    if (this.deviceMotionTracker.data.x > 8) {
      this.direction = 180 + Math.atan2(this.mSensor.y, this.mSensor.z) * (180 / Math.PI);
      this.lDirection = this.direction;
    } else if (this.deviceMotionTracker.data.y > 8) {
      this.lDirection = 360 - (180 + Math.atan2(this.mSensor.x, this.mSensor.z) * (180 / Math.PI));
    } else if (this.deviceMotionTracker.data.z > 8) {
      this.lDirection = (180 + Math.atan2(this.mSensor.x, this.mSensor.y) * (180 / Math.PI) + 90) % 360;
    }
    if (this.deviceMotionTracker.currentStepCount > this.lStepCount) {
      this.lStepCount = this.deviceMotionTracker.currentStepCount;
      this.reports.walkDirection.push(this.lDirection);
    }
  }
  flashLight() {
    this.cameraPreview.getSupportedFlashModes().then((flashModes) => {
      flashModes.forEach(function (flashMode) { console.log(flashMode + ", "); });
    });
    this.cameraPreview.getFlashMode().then((s) => {
      console.log("this.flash", s, this.cameraPreview.FLASH_MODE.ON);
      s == "on" ? (s = "off") : (s = "on");
      this.cameraPreview.setFlashMode(s);
      this.options = false;
    });
  }
  async invoiceAlert() {
    return new Promise((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: "Comments",
        inputs:  [
          {
            name: "comments",
            placeholder: "Enter Comments",
            type: "text",
          },
        ],
        buttons: [
          {
            text: "Submit",
            handler: (data) => {
              console.log("Workshop Invoice Amount: ", data);
              this.comments = data.comments;
              resolve(true)
            },
          },
        ],
        enableBackdropDismiss: false,
      });
      alert.present();
    });
  }
  timer() {
    if (!this.recordStopped) {
      this.seconds++;
      this.recordTime.seconds = this.seconds % 60;
      this.recordTime.minutes = Math.floor(this.seconds / 60);
      this.timerId = setTimeout(() => {
        this.timer();
      }, 990);
    }
  }
  private data = new Date();
  saveImage() {
    return new Promise((resolve, reject) => {
      var picNo = this.picNo;
      var locLocation = this.locationTracker.lat == 0 ? JSON.stringify(this.user.location) : this.locationTracker.getString();
      var sensorData = {
        gps: locLocation,
        magnatormeter: JSON.stringify(this.mSensor),
        orientation: this.deviceOrientationTracker.getString(),
        motion: this.deviceMotionTracker.currentStepCount,
        stepCount: this.stepCount,
        direction: this.direction,
        imageType: this.selectedImgTypes,
        comments: this.comments
      };
      var imgName;
      var offScreenCanvas = document.createElement("canvas");
      var offScreenCanvasCtx = offScreenCanvas.getContext("2d");
      var img = new Image();
      img.src = this.picture;
      img.onload = () => {
        // if (img.width > 1024) {
          var newDimensions = this.calculateAspectRatioFit( img.width, img.height, 720, 720);
          offScreenCanvas.width = newDimensions.width;
          offScreenCanvas.height = newDimensions.height;
        // } else {
        //   offScreenCanvas.width = img.width;
        //   offScreenCanvas.height = img.height;
        // }
        offScreenCanvasCtx.drawImage( img, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
        offScreenCanvasCtx.font = "20px Calibri";
        offScreenCanvasCtx.fillStyle = "red";
        var date = this.data.getDate()+"/"+(this.data.getMonth() + 1)+"/"+this.data.getFullYear()+" | "+this.data.getHours()+":"+
          (this.data.getMinutes() < 10? "0" + this.data.getMinutes() : this.data.getMinutes());
        
        var nlocLocation = locLocation != null && locLocation != undefined && locLocation.length > 2 ? JSON.parse(locLocation) : {};
        var nwlocLocation = nlocLocation.lat && nlocLocation.lng ? nlocLocation.lat +', '+ nlocLocation.lng : '';
        // if (this.docs[picNo].jessicaUrl) sensorData["jessicaUrl"] = this.docs[picNo].jessicaUrl;
        offScreenCanvasCtx.fillText( date, offScreenCanvas.width - 300, offScreenCanvas.height - 20);
        offScreenCanvasCtx.fillText( nwlocLocation, 20, offScreenCanvas.height - 20);
        var imageData = [
          offScreenCanvas.toDataURL("image/jpg", 1.0).replace(/^data:image\/(png|jpg);base64,/, ""),
        ];
        let timestampM = new Date().getTime();
        if (this.docs[picNo] && this.docs[picNo].timestamp)
          imgName = this.docs[picNo].imageStencil+"_"+this.reports.fileCount +"_"+timestampM;
        else
          imgName = this.docs[picNo] && this.docs[picNo].imageStencil ? + this.docs[picNo].imageStencil+"_"+this.reports.fileCount : this.selectedImgTypes+"_"+this.reports.fileCount;
        this.fileDog.saveFile(imageData, imgName + ".jpg", sensorData, this.data, "green").then((res) => {
          if (res == "success") {
            this.reports.fileCount++;
            let fileNameInd = this.reports.fileNames.findIndex((o) => o.fileName == imgName + "_" + this.reports.id + ".jpg");
            if (fileNameInd < 0)
              this.reports.fileNames.push({
                fileName: imgName + "_" + this.reports.id + ".jpg",
                type: this.docs[picNo] && this.docs[picNo].imgClass ? this.docs[picNo].imgClass :this.docs[0].imgClass ,
              });
            resolve("uploadSuccess");
          }
        }).catch((e) => {
          reject("uploadFaliure");
        });
      };
    });
  }
  public sideImpactCount = 0;
  public impactProcessStartIndexWriten = false;
  
  public showImpact = true;
  public nextClicked = false;
  async next(flag) {
    this.nextClicked = true;
    var ss: any;
    if (flag == undefined) {
      if (this.navParams.get("state")) {
        if(this.falseAudioStream != null){
          this.falseAudioStream.getAudioTracks().forEach((track) => track.stop());
          this.falseAudioStream = null;
        }
        this.navCtrl.push(this.possibleStates[this.nextState], {
          user: this.user,
          section: this.sectionNo,
          field: this.fieldNo,
          type: this.type
        }).then(() => {
          const index = this.viewCtrl.index;
          this.navCtrl.remove(index);
        });
      } else {

        this.nextClicked = false;
        this.preview = false;
        this.lastmedia = '';
        this.comments = '';
        this.videoStarted = false;
        this.recordStarted = false;
        this.recordStopped = false;
        if(this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].imageStencil){
        let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
        if (stInd >= 0)
          ss = this.reports.stencilsData.find((o) => o.type == this.docs[this.picNo].imageStencil);
        } else ss = this.reports.stencilsData.find((o) => o.type == this.docs[0].imageStencil);
        try {
          setTimeout(() => {
            (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
          }, 300);
        } catch (error) {
          console.log(error);
        }
        this.show = false;
        // if (this.picNo >= this.docs.length) {
        //   this.cameraPreview.stopCamera().then((succes) => {
        //     this.user.camera = false;
        //     console.log("camera got closed successfully", succes);
        //   }).catch((err) => {
        //     console.log("Issue in closing camera", JSON.stringify(err));
        //   });
        //   if (!this.hiddenRecordingStopped) this.stopHiddenRecording();
        //   console.log("walk direction===>>>", this.reports.imageTypeTaken);
        //   this.reports.updateFiles("walkDirection", this.reports, "green");
        //   for (var j = 0; j < this.reports.imageTypeTaken.length; j++) {
        //     this.reports.updateFiles(this.reports.imageTypeTaken[j].type, this.reports, "green" );
        //   }
        //   this.fullScreen.isImmersiveModeSupported().then(() => {
        //     this.fullScreen.showSystemUI();
        //   }).catch((e) => {
        //     console.error(e);
        //   });

        //   (<any>window).plugin.lightsensor.stop();
        //   this.nextState = this.reports.appConfig.states.csp;
        //   this.navCtrl.push(this.possibleStates[this.nextState], { user: this.user }).then(() => {
        //     const index = this.viewCtrl.index;
        //     this.navCtrl.remove(index);
        //   });
        // } else {
        //   let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
        //   if (stInd >= 0)
        //     ss = this.reports.stencilsData.find((o) => o.type == this.docs[this.picNo].imageStencil);
        //   if (this.docs[this.picNo].quality) this.appConfig.pictureOpts.quality = 1 * this.docs[this.picNo].quality;

        //   (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
        //   this.nextClicked = false;
        //   this.preview = false;
        // }
      }
    } else {
      // this.picNo++;
      let t = await this.invoiceAlert();
      if(this.lastmedia == 'img'){
        if(this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].imgClass){
          if (this.reports.imageTypeTaken && this.reports.imageTypeTaken.length != 0) {
            var index = this.reports.imageTypeTaken.findIndex((o) => o.type == this.docs[this.picNo].imgClass);
            if (index < 0) {
              this.reports.imageTypeTaken.push({ type: this.docs[this.picNo].imgClass, count: 0 });
            }
          } else {
            this.reports.imageTypeTaken.push({ type: this.docs[this.picNo].imgClass,  count: 0 });
          }
        } else this.reports.imageTypeTaken.push({ type: this.docs[0].imgClass,  count: 0 });
        this.saveImage().then((res) => {
          if (res == "uploadSuccess" && this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].imageStencil) {
            // this.docs[this.picNo]["count"] = 0;
            // if (flag == true) this.docs[this.picNo].count++;
            
            let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
            if (stInd >= 0)
              ss = this.reports.stencilsData.find((o) => o.type == this.docs[this.picNo].imageStencil);
            if (this.docs[this.picNo].quality) this.appConfig.pictureOpts.quality = 1 * this.docs[this.picNo].quality;

            // (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
            this.nextClicked = false;
          } else {
            ss = this.reports.stencilsData.find((o) => o.type == this.docs[0].imageStencil);
            // (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
          }
        }).catch((e) => {
          console.log("Error in saving file", e);
          if(this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].imageStencil){
            let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
            if (stInd >= 0)
              ss = this.reports.stencilsData.find((o) => o.type == this.docs[this.picNo].imageStencil);
            if (this.docs[this.picNo].quality) this.appConfig.pictureOpts.quality = 1 * this.docs[this.picNo].quality;
    
            // (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
            this.nextClicked = false;
          } else {
            ss = this.reports.stencilsData.find((o) => o.type == this.docs[0].imageStencil);
            // (<HTMLInputElement>document.getElementById("rotate90")).src = ss ? ss.loc : "./assets/img/grey_border.png";
          }
        });
      }
      else {
        ss = this.reports.stencilsData.find((o) => o.type == this.docs[0].imageStencil);
        var d = new Date();
        var locLocation = this.locationTracker.lat == 0 ? JSON.stringify(this.user.location) : this.locationTracker.getString();
        var sensorData = {
          gps: locLocation,
          magnatormeter: JSON.stringify(this.mSensor),
          orientation: this.deviceOrientationTracker.getString(),
          motion: this.deviceMotionTracker.currentStepCount,
          stepCount: this.stepCount,
          direction: this.direction,
          timestamp: this.data,
          imageType: this.videoName,
          comments: this.comments
        };
        this.reports.fileUploadMonitor.push({
          location: this.videoURL,
          filename: this.videoName,
          sensorData: sensorData,
          d: d,
          timestamp: new Date(),
          i: this.reports.fileUploadMonitor.length,
          status: "s",
        });
        this.fileDog.uploadDrirect(this.user, this.reports, this.videoURL, this.videoName, sensorData, d, "green");
        this.reports.videoObject.push({
          location: this.videoURL,
          fileName: this.videoName,
          sensorData: sensorData,
          d: d,
          timestamp: new Date(),
          i: this.reports.fileUploadMonitor.length,
          status: "s",
        });
      }
      
      this.nextClicked = false;
      this.preview = false;
      this.lastmedia = '';
      this.comments = '';
      this.videoStarted = false;
      this.recordStarted = false;
      this.recordStopped = false;
      if(this.docs.length == 1 && !flag){
        this.nextPage();
      }
      if(!flag) {
        this.show = false;
      } 
      
    }
    this.saveToNative();
  }
  nextPage(){
    try {
      if (this.navParams.get("state") == undefined || this.navParams.get("state") == null) {
        if (!this.hiddenRecordingStopped) this.stopHiddenRecording();
        this.reports.updateFiles("walkDirection", this.reports, "green");
        for (var x = 0; x < this.reports.imageTypeTaken.length; x++) {
          this.reports.updateFiles(this.reports.imageTypeTaken[x].type, this.reports, "green" );
        }
      }
      this.reports.updateFiles("video", this.reports, "green");
      if(this.usingMediaCapture){
        this.cameraPreview.stopCamera().then((succes) => {
          this.user.camera = false;
          console.log("camera got closed successfully", succes);
        }).catch((err) => {
          console.log("Issue in closing camera", JSON.stringify(err));
        });
      }
      else {
        if (this.stream != null) {
          this.stream.getAudioTracks().forEach((track) => track.stop());
          this.stream.getVideoTracks().forEach((track) => track.stop());
        }
        this.stream = null;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      this.deviceMotionTracker.stopStepCount();
      this.locationTracker.stopTracking();
      (<any>window).plugin.lightsensor.stop();
      this.fullScreen.isImmersiveModeSupported().then(() => {
        this.fullScreen.showSystemUI();
      }).catch((e) => {
        console.error(e);
      });
    } catch (error) {
      console.log(error); 
    }
    
    console.log("walk direction===>>>", this.reports.imageTypeTaken);
    
    if (this.navParams.get("state")) {
      if(this.falseAudioStream != null){
        this.falseAudioStream.getAudioTracks().forEach((track) => track.stop());
        this.falseAudioStream = null;
      }
      this.navCtrl.push(this.possibleStates[this.nextState], {
        user: this.user,
        section: this.sectionNo,
        field: this.fieldNo,
        type: this.type,
      }).then(() => {
        const index = this.viewCtrl.index;
        this.navCtrl.remove(index);
      });
    } else {
      this.nextState = this.reports.appConfig.states.cpp;
      if(this.reports.processChanged) {
        if(this.reports.firstPageSelected == "CameraPropertyPage")
          this.nextState = "FormPropertyPage";
        else {
          this.nextState = this.reports.appConfig.states.fpp;
        }
      }
      this.navCtrl.push(this.possibleStates[this.nextState], { user: this.user }).then(() => {
        const index = this.viewCtrl.index;
        this.navCtrl.remove(index);
      });
    }
  }
  offlineStencil() {
    let flag = false;
    let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
    if (stInd >= 0) flag = true;
    (<HTMLInputElement>document.getElementById("rotate90")).src = "./assets/img/grey_border.png";
  }
  impactConfirm() {
    this.alertCtrl.create({
      title: "Was " + this.docs[this.picNo].imageStencil + " side impacted?",
      buttons: [
        {
          text: "No",
          role: "cancel",
          handler: () => { this.next(false);},
        },
        {
          text: "Yes",
          handler: () => {
            console.log("Impact confirmed");
            this.impactSide.push(this.docs[this.picNo].imageStencil);
            this.allImpactNo++;
            this.next(false);
          },
        },
      ],
      enableBackdropDismiss: false,
    }).present();
  }

  ngAfterViewInit() {
    console.log(document.getElementById("cam").offsetWidth);
  }

  takeAgain() {
    this.nextClicked = false;
    this.preview = false;
    this.lastmedia = '';
    this.comments = '';
    this.videoStarted = false;
    this.recordStarted = false;
    this.recordStopped = false;
    var ss = null;
    if(this.picNo < this.docs.length && this.docs[this.picNo] && this.docs[this.picNo].imageStencil){
      let stInd = this.reports.stencilsData.findIndex((o) => o.type == this.docs[this.picNo].imageStencil);
      if (stInd >= 0)
        ss = this.reports.stencilsData.find((o) => o.type == this.docs[this.picNo].imageStencil);
    } else ss = this.reports.stencilsData.find((o) => o.type == this.docs[0].imageStencil);
    try {
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById("rotate90")).src = ss && ss.loc ? ss.loc : "./assets/img/grey_border.png";
      }, 200);
    } catch (error) {
      console.log("inside take again 2", error);
    }
    
    console.log("inside take again 2");
    
  }

  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight];
    let ratioNew = Math.min(ratio[0], ratio[1]);
    return { width: srcWidth * ratioNew, height: srcHeight * ratioNew };
  }

  showAlert(data) {
    let alert = this.alertCtrl.create({
      title: data.title,
      message: data.message,
      buttons: data.buttons,
      enableBackdropDismiss: false,
    });
    alert.present();
  }

  checkLightIntensity() {
    var t = this;
    (<any>window).plugin.lightsensor.watchReadings( function success(reading) {
        if (reading.intensity > 0 && reading.intensity < 25) {
          var data = {
            title: "Warning !!",
            message: "You are taking pictures in dim light.\n Your application may be rejected.\n Kindly take pictures in proper light.",
            buttons: [
              {
                text: "Continue",
                role: "cancel",
              },
              {
                text: "Try Later",
                handler: () => {
                  console.log("Buy clicked");
                },
              },
            ],
          };
          t.showAlert(data);
          (<any>window).plugin.lightsensor.stop();
        }
      }, function error(message) {
        console.log(message);
      }
    );
  }
  checkLocation() {
    var data = {
      title: "Please Enable GPS",
      message: "Please Enable GPS before proceeding further.",
      buttons: [
        {
          text: "Ok",
          handler: () => {
            this.openNativeSettings.open("location");
          },
        },
      ],
    };
    return new Promise((resolve, reject) => {
      this.diagnostic.isLocationEnabled().then((isAvailable) => {
        console.log("LOCATION AVAILABLE ==> ", isAvailable);
        if (!isAvailable) {
          this.showAlert(data);
          resolve(false);
        } else resolve(true);
      }).catch((e) => {
        console.log(e);
        this.showAlert(data);
        resolve(false);
      });
    });
  }
  saveToNative() {
    if (this.picNo == 1) {
      var inspectionStartTime = { startTime: new Date() };
      this.nativeStorage.setItem("startTime", inspectionStartTime).then(
        () => console.log("inspectionStartTime Stored item!"),
        (error) => { console.error("Error storing item", error); }
      );
    }
    this.reports.praReport = true;
    var inProcess = {
      process: this.reports.process,
      stencilsData: this.reports.stencilsData,
      claimForm: this.reports.claimForm,
      appConfig: this.reports.appConfig,
      walkDirection: this.reports.walkDirection,
      appState: "CameraPropertyPage",
      picNoCSP: this.reports.picNoCSP,
      imageTypeTaken: this.reports.imageTypeTaken,
      fileNames: this.reports.fileNames,
      praReport : this.reports.praReport,
      videoObject: this.reports.videoObject,
      audioObject: this.reports.audioObject,
      signObject: this.reports.signObject,
      reportImg: this.reports.reportImg,
      changeProcess: this.reports.changeProcess,
      processChanged: this.reports.processChanged,
      firstPageSelected: this.reports.firstPageSelected,
      hiddenImages: this.reports.hiddenImages,
      workshops: this.reports.workshops,
      fileUploadMonitor: this.reports.fileUploadMonitor,
      location: this.reports.location,
      reportId: this.reports.id,
      app: this.reports.app,
      companyId: this.reports.companyId,
      survey: this.reports.survey,
      surveyType: this.reports.surveyType,
      localFiles: this.reports.localFiles,
      hiddenImageCount: this.reports.hiddenImageCount,
      fileRootLocation: this.reports.fileRootLocation,
      putMonitor: this.reports.putMonitor,
    };
    if (!this.reports.inProcessUploading) {
      this.nativeStorage.setItem("inProcess", inProcess).then(
        () => console.log("Stored item!**********", inProcess),
        (error) => { console.error("Error storing item", error); }
      );
    }
  }
  checkBlur(imgSrc, meanStDev) {
    var img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      let src = cv.imread(img);
      let dst = new cv.Mat();
      let men = new cv.Mat();
      let menO = new cv.Mat();
      let meanStdDev = meanStDev || 9;
      cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
      // You can try more different parameters
      cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
      cv.meanStdDev(dst, menO, men);
      console.log(
        cv.meanStdDev(dst, menO, men),
        menO.data64F[0],
        men.data64F[0]
      );
      if (men.data64F[0] < meanStdDev) {
        var msg = "Blur image detected. Kindly click the image again.";
        if (this.docs[this.picNo].detectBlur && this.docs[this.picNo].detectBlur.message)
          msg = this.docs[this.picNo].detectBlur.message;
          
        const confirm = this.alertCtrl.create({
          title: "Alert!!",
          message: msg,
          enableBackdropDismiss: false,
          buttons: [
            {
              text: "Ok",
              handler: () => {
                this.takeAgain();
              },
            },
          ],
        });
        //confirm.dismiss(()=> {console.log('The alert has been closed.');this.preview=false; this.takeAgain();});
        confirm.present();
      }
    };
  }
}
