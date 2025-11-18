import { Headers } from'@angular/http';

export var contentHeaders = new Headers();

contentHeaders.append('Accept', 'application/json');
contentHeaders.append('Content-Type', 'application/json');

let apiUrls = [ "http://192.168.0.9:4000/api/",
				"http://newapi.test.livechek.com/api/",
				"https://newapi.livechek.com/api/" ];

export const apiBaseUrl = apiUrls[2];
