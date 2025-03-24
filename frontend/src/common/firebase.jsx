
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCXhlzLfFpvxgMQ9AD9pAPNkIYOUZ_GrLc",
  authDomain: "blogwebsite-6d75e.firebaseapp.com",
  projectId: "blogwebsite-6d75e",
  storageBucket: "blogwebsite-6d75e.firebasestorage.app",
  messagingSenderId: "389178947259",
  appId: "1:389178947259:web:286e6f58b32af6025cdb9e"
};

const app = initializeApp(firebaseConfig);


const provider=new GoogleAuthProvider()

const auth=getAuth();

export const authWithGoogle =async()=>{
    let user=null;
    await signInWithPopup(auth, provider)
    .then((result) => {
        user=result.user;
    })
    .catch((error) => {
        console.error(error);
    })

    return user;
}