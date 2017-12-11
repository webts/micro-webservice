import WebService from './WebService';
import dot from 'dot';
import path from 'path';
import cpy from 'cpy';

export default class WebAppService extends WebService
{
    constructor(opts){
        super(opts);
    }

    defaults(){
        super.defaults();
        const base = this;

        if('views' in this.options)
        {
            const path = path.join(this.cwd , '_views/');
            let views = [this.options.views];
            if(Array.isArray(this.options.views)) views = this.options.views;
            cpy(views,'_views',{cwd:this.cwd})
                .then(() =>
                {
                    base.dots = dot.process({path});
                    base.server.engine('dot', (file, data, callback ) =>
                    {
                        const name = path.basename(file,'.dot');
                        if(name in base.dots){
                            callback(null, base.dots[name](data));
                        }
                        else callback(new Error('Invalid template file ' + name));
                    });
                    base.server.set('views', path);
                    base.server.set('view engine', 'dot');
                });


        }
    }
}