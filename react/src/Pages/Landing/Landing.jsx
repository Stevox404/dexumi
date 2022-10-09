import { isOnline } from "Utils";
import LandingOffline from "./LandingOffline";
import LandingOnline from "./LandingOnline";

function Landing() {    
    if(isOnline()) {
        return <LandingOnline />
    } else {
        return <LandingOffline />
    }
}




export default Landing;