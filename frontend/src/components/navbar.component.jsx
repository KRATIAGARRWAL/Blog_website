import { Link, Outlet, useNavigate } from "react-router-dom";

import image from "../imgs/image.png"

import { useContext, useState } from "react"
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";


const Navbar = () => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false)
    const [userNavPanel, setUserNavPanel] = useState(false);

    let navigate = useNavigate()

    const { userAuth, userAuth: { access_token, profile_img } } = useContext(UserContext);

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;
        if (e.keyCode == 13 && query.length) {
            navigate(`/search/${query}`)
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 500);
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-12 h-12">
                    <img src={image} className="w-full" />
                </Link>
                <div className="relative bg-white w-[50%] py-4 px-[5vw] border-b border-grey md:border-0 md:block  md:inset-0 md:p-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            onKeyDown={handleSearch}
                            className="w-full bg-grey p-4 pl-6 pr-12 rounded-full placeholder:text-dark-grey md:pl-12"
                        />
                        <i className="fi fi-rr-search absolute right-6 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
                    </div>
                </div>


                <div className="flex items-center gap-3 md:gap-6 ml-auto">
                    

                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-edit text-2xl"></i>
                        <p>Write</p>
                    </Link>


                    {
                        access_token ?
                            <>
                                <Link to="/dashboard/notification" >
                                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                                        <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                                    </button>

                                </Link>

                                <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                    <button className="w-11 h-11 mt-1">
                                        <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                                    </button>
                                    {userNavPanel ? <UserNavigationPanel /> : ""}

                                </div>
                            </>
                            :
                            <>
                                <Link className="btn-dark py-2" to="/signin">
                                    <p>Sign In</p>
                                </Link>
                                <Link className="btn-light py-2 hidden md:block" to="/signup">
                                    <p>Sign up</p>
                                </Link>
                            </>
                    }




                </div>

            </nav>
            <Outlet /></>
    )
}

export default Navbar;