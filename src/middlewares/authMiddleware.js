export const isAdminAuth=(req,res,next)=>{
    if(!req.session.isAdminLogged)
    {
        res.redirect('/admin/login');
    }
    next();
}

export const isAdminAuthenticated=(req,res,next)=>{
    if(req.session.isAdminLogged)
    {
        res.redirect('/admin/brands');
        // const referer = req.get('Referer');
        // console.log('referer',referer);
        // console.log(req.header('Referer'));
        // const redirectUrl = req.header('Referer') || '/'; 
    }
    next();
}

export const isClientAuth = (req,res,next)=>{
    if(!req.session.userAuthenticated)
    {
        res.redirect('/');
    }
    next();
}

export const isClientAuthenticated = (req,res,next)=>{
    if(req.session.userAuthenticated)
    {
        res.redirect('/');
    }
    next();
}