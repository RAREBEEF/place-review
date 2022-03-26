// 지도 드래그 시 드래그 된 지도 중심 위치로 마커(마커 드래그 이벤트 & 지도 중심 좌표 얻어오는 메소드 활용)
// TODO:추가로 redux 이식할 state 체크
// 로딩 시 검색 막을 방법

import React, { ReactElement, useEffect, useRef } from "react";
import { useState } from "react";
import styles from "./Map.module.scss";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { getMapThunk } from "../redux/modules/getMap";
import { stateType } from "../types";
import Loading from "../pages/Loading";

const Map: React.FC = (): ReactElement => {
  console.log("rendered");
  const dispatch = useDispatch();
  const { loading, data, markerPos, currentPos } = useSelector(
    (state: stateType) => state.getMap
  );
  const map = data.map;
  const geocoder = data.geocoder;

  const [marker, setMarker] = useState<any>();

  const mapEl = useRef(null);

  const [crossActive, setCrossActive] = useState<boolean>(false);

  const [currentAddress, setCurrentAddress] = useState<any>({});

  // state.data.geocoder.coord2Address(
  //   action.markerPos.getLng(),
  //   action.markerPos.getLat(),
  //   (result: any, status: any) => {
  //     if (status === window.kakao.maps.services.Status.OK) {
  //       console.log(result);
  //     }
  //   }
  // );

  useEffect(() => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      geocoder.coord2Address(
        currentPos.getLng(),
        currentPos.getLat(),
        (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setCurrentAddress({
              address: result[0].address.address_name,
              roadAddress: result[0].road_address?.address_name,
            });
          }
        }
      );
    }
  }, [currentPos, geocoder]);

  useEffect((): void => {
    dispatch(getMapThunk(mapEl.current));
  }, [dispatch]);

  useEffect(() => {
    const dragStartCallback = () => {
      setCrossActive(true);
    };
    const dragEndCallback = () => {
      setCrossActive(false);
    };
    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragstart", dragStartCallback);
      window.kakao.maps.event.addListener(map, "dragend", dragEndCallback);
    }
    // return () => {
    //   window.kakao.maps.event.removeListener(
    //     map,
    //     "dragstart",
    //     dragStartCallback
    //   );
    //   window.kakao.maps.event.removeListener(map, "dragend", dragEndCallback);
    // };
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

  return (
    <div className={classNames(styles.container)}>
      <div className={styles["current-address"]}>
        현재 위치 : {currentAddress.address}
      </div>
      <div
        ref={mapEl}
        id="map"
        style={{ width: "70vw", height: "90vh", minHeight: "500px" }}
      >
        {loading && <Loading />}
      </div>
      {crossActive && <div className={styles.cross}>+</div>}
    </div>
  );
};

export default Map;
