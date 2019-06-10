// Copyright (c) 2019 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import { Module, NPMPackage } from '@yourwishes/app-base';
import * as nodemailer from 'nodemailer';
import { IEmailApp } from '~app';

export const CONFIG_HOST = 'email.host';
export const CONFIG_PORT = 'email.port';
export const CONFIG_SECURE = 'email.secure';
export const CONFIG_AUTH_USERNAME = 'email.username';
export const CONFIG_AUTH_PASSWORD = 'email.password';
export const CONFIG_REPLY = 'email.reply';

export class EmailModule extends Module {
  app:IEmailApp;
  transporter:nodemailer.Transporter;

  reply:string;

  constructor(app:IEmailApp) {
    super(app);
  }

  async init():Promise<void> {
    let { config } = this.app;
    if(!config.has(CONFIG_HOST)) throw new Error("Missing host in email configuration.");
    if(!config.has(CONFIG_AUTH_USERNAME)) throw new Error("Missing username in email configuration.");
    if(!config.has(CONFIG_AUTH_PASSWORD)) throw new Error("Missing password in email configuration.");
    if(!config.has(CONFIG_REPLY)) throw new Error("Missing reply details in email configuration.");

    let ip = config.get(CONFIG_HOST);
    let secure = config.has(CONFIG_SECURE) ? true : false;
    let port = config.get(CONFIG_PORT) || secure ? 465 : 587;
    let username = config.get(CONFIG_AUTH_USERNAME);
    let password = config.get(CONFIG_AUTH_PASSWORD);
    this.reply = config.get(CONFIG_REPLY);

    this.logger.debug('Connecting to email host...');

    this.transporter = await nodemailer.createTransport({
      host: ip, port, secure, auth: { user: username, pass: password }
    });

    this.logger.debug('Connected to email server!');
  }

  async sendMail(to:string|string[], subject: string, text:string, html?:string):Promise<{[key:string]:boolean}> {
    to = Array.isArray(to) ? to : [ to ];
    let res = await this.transporter.sendMail({
      from: this.reply, to: to.join(', '), subject, text, html: html || text
    });

    return to.reduce((x,t) => {
      x[t] = res.accepted.some(s => s == t);
      return x;
    }, {});
  }

  async destroy() {
    this.transporter.close();
  }

  loadPackage():NPMPackage {
    return require('./../../package.json');
  }
}
