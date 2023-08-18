!macro customUnInstall
    SetRegView 64
     DeleteRegKey HKCR "s3"
    SetRegView 32
     DeleteRegKey HKCR "s3"
 !macroend