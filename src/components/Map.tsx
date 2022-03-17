// 현재까지 구현한 기능
// 지도
// 검색
// 검색 결과 지도 중심 근처 우선
// 검색 결과 페이지네이션
// TODO:검색된 위치 표시 기능(미커)
// 지도 드래그 시 드래그 된 지도 중심 위치로 마커(마커 드래그 이벤트 & 지도 중심 좌표 얻어오는 메소드 활용)
// 해당 좌표를 리뷰 작성 페이지로 전달할 방법 생각해보기(redux에서 맵 컴포넌트로 데이터 뿌려주기?)

import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useCallback } from "react";
import styles from "./Map.module.scss";
import classNames from "classnames";

declare global {
  interface Window {
    kakao: any;
  }
}

const Map: React.FC = () => {
  console.log("rendered");
  const [map, setMap] = useState<any>();
  const [places, setPlaces] = useState<any>({});
  const [geocoder, setGeocoder] = useState<any>({});
  const [marker, setMarker] = useState<any>();
  const [markerPos, setMarkerPos] = useState<any>();

  const [keyword, setKeyword] = useState<string | number>("");
  const [address, setAddress] = useState<string | number>("");
  const [recentSearch, setRecentSearch] = useState<Array<string | number>>([
    "",
    "",
  ]);

  const [loading, setLoading] = useState(true);

  const [searchResult, setSearchResult] = useState<Array<Object>>([]);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [pagination, setPagination] = useState<any>({
    nextClick: () => {},
    prevClick: () => {},
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selected, setSelected] = useState(0);

  const MapEl = useRef(null);

  const getData = useCallback((): any => {
    if (window.navigator) {
      window.navigator.geolocation.getCurrentPosition((pos) => {
        const location = new window.kakao.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        );

        setMarkerPos(location);

        const options = {
          center: location,
          level: 4,
        };

        setMap(new window.kakao.maps.Map(MapEl.current, options));
        setPlaces(new window.kakao.maps.services.Places(map));

        setGeocoder(new window.kakao.maps.services.Geocoder());

        setLoading(false);
      });
    } else {
      // setMarkerPos(new window.kakao.maps.LatLng(33.450701, 126.570667));
      const options = {
        center: markerPos,
        level: 3,
      };

      setMap(new window.kakao.maps.Map(MapEl.current, options));
      setPlaces(new window.kakao.maps.services.Places(map));

      setGeocoder(new window.kakao.maps.services.Geocoder());

      setLoading(false);
    }
  }, [map, markerPos]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (markerPos) {
      marker?.setMap(null);
      const displayMarker = (position: any) => {
        setMarker(
          new window.kakao.maps.Marker({
            map: map,
            position: markerPos,
          })
        );
      };
      displayMarker(markerPos);
    }
  }, [map, markerPos]);

  // 검색 콜백
  const searchCallback = useCallback(
    (result: any, status: any, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setError(false);
        setIsZero(false);
        setSearchResult(result);
        const { x, y } = result[0];
        const location = new window.kakao.maps.LatLng(y, x);
        setMarkerPos(location);
        map.panTo(location);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setError(false);
        setIsZero(true);
        setSearchResult([]);
      } else {
        setSearchResult([]);
        setError(true);
        setIsZero(false);
      }

      setPagination({
        nextClick: () => {
          if (pagination.hasNextPage) {
            setCurrentPage((prevState) => prevState + 1);
            pagination.nextPage();
          }
        },
        prevClick: () => {
          if (pagination.hasPrevPage) {
            setCurrentPage((prevState) => prevState - 1);
            pagination.prevPage();
          }
        },
        totalCount: pagination.totalCount,
      });
    },
    [map]
  );

  // 장소 검색
  const keywordSearch = useCallback(
    (keyword: string | number) => {
      setCurrentPage(1);
      places.keywordSearch(keyword, searchCallback, {
        location: map.getCenter(),
      });
    },
    [places, searchCallback, map]
  );

  // 주소 검색
  const addressSearch = useCallback(
    (keyword: string | number) => {
      setCurrentPage(1);
      geocoder.addressSearch(keyword, searchCallback, {
        location: map.getCenter(),
      });
    },
    [geocoder, searchCallback, map]
  );

  // 장소 검색 submit
  const onKeywordSubmit = useCallback(
    (e) => {
      e.preventDefault();
      keywordSearch(keyword);
      setRecentSearch([keyword, "장소"]);
      setKeyword("");
    },
    [keywordSearch, keyword]
  );

  // 주소 검색 submit
  const onAddressSubmit = useCallback(
    (e) => {
      e.preventDefault();
      addressSearch(address);
      setRecentSearch([address, "주소"]);
      setAddress("");
    },
    [addressSearch, address]
  );

  const onKeywordChange = useCallback((e) => {
    e.preventDefault();
    setKeyword(e.target.value);
  }, []);

  const onAddressChange = useCallback((e) => {
    e.preventDefault();
    setAddress(e.target.value);
  }, []);

  return (
    <div className={styles.container}>
      <div ref={MapEl} id="map" style={{ width: "500px", height: "400px" }} />
      <form onSubmit={onKeywordSubmit}>
        <input
          type="text"
          value={keyword}
          onChange={onKeywordChange}
          placeholder="장소 검색"
        />
      </form>
      <form onSubmit={onAddressSubmit}>
        <input
          type="text"
          value={address}
          onChange={onAddressChange}
          placeholder="주소 검색"
        />
      </form>

      {recentSearch[0].toString().length !== 0 && (
        <div className={styles["result"]}>
          <h2 className={styles["result__header"]}>
            "{recentSearch[0]}" 에 대한 {recentSearch[1]} 검색 결과
          </h2>
          {error && (
            <div className={styles["result__error"]}>
              오류가 발생했습니다. 잠시후 다시 시도해주세요.
            </div>
          )}
          {isZero ? (
            <div className={styles["result__zero"]}>검색 결과가 없습니다.</div>
          ) : (
            <div>
              <ul>
                {searchResult.map((el: any, i: any) => (
                  <li
                    className={classNames(
                      styles["result__list"],
                      selected === i && styles.selected
                    )}
                    key={i}
                    onClick={() => {
                      map.panTo(new window.kakao.maps.LatLng(el.y, el.x));
                      map.setLevel(1);
                      setMarkerPos(new window.kakao.maps.LatLng(el.y, el.x));
                      setSelected(i);
                    }}
                  >
                    <div className={styles["result__place-name"]}>
                      {el.place_name}
                    </div>
                    <div className={styles["result__address"]}>
                      {el.place_name ? `(${el.address_name})` : el.address_name}
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles["resut__pagination"]}>
                <button onClick={pagination.prevClick}>prev</button>
                <span>
                  {currentPage} / {Math.ceil(pagination.totalCount / 15)}
                </span>
                <button onClick={pagination.nextClick}>next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Map;
