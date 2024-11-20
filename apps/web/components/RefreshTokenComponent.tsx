import useRefreshToken from "../hooks/useRefreshToken";
import {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../store/store";

/*
 A component that refreshes the access token periodically, lives at outside the main pages, and stop when user logs out
 */
const RefreshTokenComponent = () => {

  const {error, response, loading, refreshTokenOperation} = useRefreshToken();
  const refreshTokenTimeout = useRef(null);
  const isLoggedInFromState = useSelector((state: RootState) => state.context.isAccessTokenSet);
  // only run this once
  const [count, setCount] = useState(0);

  const TIMEOUT = 13 * 60 * 1000;

  useEffect(() => {
    if (!isLoggedInFromState) {
      console.log('logged out, stopping timer')
      stopRefreshTokenTimer();
      return;
    }
    console.log('logged in now start timer')
    startRefreshTokenTimer();
  }, [isLoggedInFromState]);

  useEffect(() => {
    if (error) {
      // if refreshToken fails, stop the timer
      console.log('stopping timer due to error ', error)
      stopRefreshTokenTimer();
    }
  }, [error]);

  useEffect(() => {
    // Cleanup function to stop the timer when the component unmounts
    return () => {
      console.log('unmounting, stopping timer')
      stopRefreshTokenTimer();
    }
  }, []);

  // refresh access token that runs periodically
  const startRefreshTokenTimer = () => {
    if (localStorage.getItem('ctims-accessToken') && count === 0) {
      setCount(count + 1);
      // clear the previous interval
      if (refreshTokenTimeout.current) {
        clearInterval(refreshTokenTimeout.current);
      }

      refreshTokenTimeout.current = setInterval(() => myCallback(), TIMEOUT);
    }
  }

  const myCallback = () => {
    refreshTokenOperation();
  }

  const stopRefreshTokenTimer = () => {
    if (refreshTokenTimeout.current) {
      setCount(0);
      clearInterval(refreshTokenTimeout.current);
      refreshTokenTimeout.current = null;
    }
  }

  return (
    <></>
  )
}

export default RefreshTokenComponent;
