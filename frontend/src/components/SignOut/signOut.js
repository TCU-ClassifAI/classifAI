import { Auth } from "aws-amplify";

export default async function signOut(){
    try{
        await Auth.signOut();
    }catch (error){
        console.log('error signing out: ', error);
    }
}

