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
import Loading from "./Loading";

const Map: React.FC = (): ReactElement => {
  console.log("rendered");
  const dispatch = useDispatch();
  const { loading, data, markerPos } = useSelector(
    (state: stateType) => state.getMap
  );
  const map = data.map;

  const [marker, setMarker] = useState<any>();

  const mapEl = useRef(null);

  const [crossActive, setCrossActive] = useState<boolean>(false);

  // state.data.geocoder.coord2Address(
  //   action.markerPos.getLng(),
  //   action.markerPos.getLat(),
  //   (result: any, status: any) => {
  //     if (status === window.kakao.maps.services.Status.OK) {
  //       console.log(result);
  //     }
  //   }
  // );

  useEffect((): void => {
    dispatch(getMapThunk(mapEl.current));
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragstart", () => {
        setCrossActive(true);
      });
      window.kakao.maps.event.addListener(map, "dragend", () => {
        setCrossActive(false);
      });
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
      // const displayMarker = (position: any) => {
      //   setMarker(
      //     new window.kakao.maps.Marker({
      //       map: map,
      //       position: position,
      //     })
      //   );
      // };
      // displayMarker(markerPos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markerPos]);

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <div ref={mapEl} id="map" style={{ width: "70vw", height: "90vh" }}>
        {loading && <Loading />}
      </div>
      {crossActive && <div className={styles.cross}>+</div>}
    </div>
  );
};

export default Map;
