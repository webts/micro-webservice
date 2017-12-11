import WebService from "./WebService";
import express from 'express';

export default class StaticFilesService extends WebService
{
    constructor(opts){super(opts)}

    defaults(){
        super.defaults();
        this.server.use(express.static(this.options.views || this.options.assets || this.options.root,
            {setHeaders: this.setHeaders}));
    }

    setHeaders(res, path, stat){
        //override by plugins
    }
}