import { AdInterface } from "./index";

class InterstitialAd implements AdInterface {
  private readonly ad;
  private readonly unitId;

  constructor(unitId: string) {
    this.unitId = unitId;
    // this.ad = firebase.admob().interstitial(this.unitId);
    this.load();
  }

  load() {
    // const AdRequest = firebase.admob.AdRequest;
    // const request = new AdRequest();
    // this.ad.loadAd(request.build());
  }

  show() {
    // if (this.ad && this.ad.isLoaded()) {
    //   this.ad.show();
    // }
    // setTimeout(() => {
    //   this.load();
    // }, 5000);
  }
}

class NoopAd implements AdInterface {
  show() {
  }
}


function getReloadAd() {
  // switch (Platform.OS) {
  //   case 'android':
  //     return new InterstitialAd(ADMOB_APP_ID_ANDROID);
  //   case 'ios':
  //     return new InterstitialAd(ADMOB_APP_ID_IOS);
  //   default:
  //     return new NoopAd();
  // }
  return new NoopAd();
}

export const reloadAd: AdInterface = getReloadAd();