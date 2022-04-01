import React, { ReactElement, useEffect, useRef } from "react";
import { useState } from "react";
import styles from "./Map.module.scss";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { getMapThunk } from "../redux/modules/getMap";
import {
  currentAddressType,
  getMapStateType,
  markerAddressType,
  stateType,
} from "../types";
import Loading from "../pages/Loading";
import markerImg from "../images/marker100.png";

const Map: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const {
    loading,
    data: { map, geocoder },
    markerPos,
    currentPos,
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  const [marker, setMarker] = useState<any>();
  const [crossActive, setCrossActive] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<currentAddressType>({
    address: "",
    roadAddress: "",
  });
  const [markerAddress, setMarkerAddress] = useState<markerAddressType>({
    address: "",
    roadAddress: "",
  });
  const mapEl = useRef(null);

  useEffect(() => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      geocoder.coord2Address(
        currentPos.getLng(),
        currentPos.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setCurrentAddress({
              address: result[0].address.address_name,
              roadAddress: result[0].road_address?.address_name,
            });
          }
        }
      );
      geocoder.coord2Address(
        markerPos.getLng(),
        markerPos.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setMarkerAddress({
              address: result[0].address.address_name,
              roadAddress: result[0].road_address?.address_name,
            });
          }
        }
      );
    }
  }, [currentPos, geocoder, markerPos]);

  useEffect((): void => {
    dispatch(getMapThunk(mapEl.current));
  }, [dispatch]);

  useEffect((): void => {
    const dragStartCallback = (): void => {
      setCrossActive(true);
    };
    const dragEndCallback = (): void => {
      setCrossActive(false);
    };
    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragstart", dragStartCallback);
      window.kakao.maps.event.addListener(map, "dragend", dragEndCallback);
    }
  }, [map]);

  useEffect((): void => {
    if (markerPos) {
      marker?.setMap(null);
      setMarker(
        new window.kakao.maps.Marker({
          map: map,
          position: markerPos,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markerPos]);

  useEffect((): void => {
    const icon = new window.kakao.maps.MarkerImage(
      markerImg,
      new window.kakao.maps.Size(40, 48),
      {
        alt: "Place Review marker",
      }
    );
    marker?.setImage(icon);
  }, [marker]);

  return (
    <div className={classNames(styles.container)}>
      <div className={styles["address"]}>
        <div className={styles["address__current"]}>
          현재 위치 : {currentAddress.address}
        </div>
        <div className={styles["address__marker"]}>
          마커 위치 : {markerAddress.address}
        </div>
      </div>
      <div
        ref={mapEl}
        id="map"
        style={{
          width: "70vw",
          height: "calc(100vh - 60px)",
          minHeight: "500px",
        }}
      >
        {loading && <Loading />}
      </div>
      {crossActive && <div className={styles.cross}>+</div>}
    </div>
  );
};

export default Map;
