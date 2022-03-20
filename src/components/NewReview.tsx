import styles from "./NewReview.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMarkerPos } from "../redux/modules/getMap";
import {
  paginationStateType,
  recentSearchStateType,
  stateType,
} from "../types";

const NewReview: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const { loading, data, currentPos, markerPos } = useSelector(
    (state: stateType) => state.getMap
  );

  const map = data.map;
  const places = data.places;
  const geocoder = data.geocoder;

  const [searchKeyword, setSearchKeyword] = useState<string | number>("");
  const [searchAddress, setSearchAddress] = useState<string | number>("");
  const [recentSearch, setRecentSearch] = useState<recentSearchStateType>({
    text: "",
    type: "",
  });

  const [searchResult, setSearchResult] = useState<Array<any>>([]);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [pagination, setPagination] = useState<paginationStateType>({
    nextClick: () => {},
    prevClick: () => {},
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selected, setSelected] = useState<number>(0);

  const [address, setAddress] = useState<any>({});

  // 최초 위치 주소
  // useEffect(() => {
  //   if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
  //     geocoder.coord2Address(
  //       currentPos.getLng(),
  //       currentPos.getLat(),
  //       (result: any, status: any) => {
  //         if (status === window.kakao.maps.services.Status.OK) {
  //           setAddress({
  //             current: {
  //               address: result[0].address.address_name,
  //               roadAddress: result[0].road_address?.address_name,
  //             },
  //           });
  //         }
  //       }
  //     );
  //   }
  // }, [currentPos, geocoder]);

  // 마커 위치 변경 시 주소
  useEffect(() => {
    if (Object.keys(map).length !== 0) {
      geocoder.coord2Address(
        markerPos.getLng(),
        markerPos.getLat(),
        (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setAddress((prev: any) => ({
              address: result[0].address.address_name,
              roadAddress: result[0].road_address?.address_name,
            }));
          }
        }
      );
    }
  }, [markerPos, geocoder, map]);

  console.log(address);

  // 검색 콜백
  const searchCallback = useCallback(
    (result: any, status: any, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setError(false);
        setIsZero(false);
        setSearchResult(result);
        const { x, y } = result[0];
        const location = new window.kakao.maps.LatLng(y, x);
        map.setCenter(location);
        dispatch(setMarkerPos(location));
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
    [map, dispatch]
  );

  // 장소 검색
  const keywordSearch = useCallback(
    (keyword: string | number) => {
      places.keywordSearch(keyword, searchCallback, {
        location: currentPos,
      });
    },
    [places, searchCallback, currentPos]
  );

  // 주소 검색
  const addressSearch = useCallback(
    (keyword: string | number) => {
      geocoder.addressSearch(keyword, searchCallback, {
        location: currentPos,
      });
    },
    [geocoder, searchCallback, currentPos]
  );

  // 장소 검색 submit
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setCurrentPage(1);
      setSelected(0);
      if (searchKeyword === "" && searchAddress === "") {
        setRecentSearch({ text: "", type: "" });
        map.setCenter(currentPos);
        dispatch(setMarkerPos(currentPos));
      } else if (searchKeyword !== "") {
        keywordSearch(searchKeyword);
        setRecentSearch({ text: searchKeyword, type: "장소" });
        // setSearchKeyword("");
      } else if (searchAddress !== "") {
        addressSearch(searchAddress);
        setRecentSearch({ text: searchAddress, type: "주소" });
        // setSearchAddress("");
      }
    },
    [
      searchKeyword,
      searchAddress,
      map,
      currentPos,
      dispatch,
      keywordSearch,
      addressSearch,
    ]
  );

  // 주소 검색 submit
  // const onAddressSubmit = useCallback(
  //   (e) => {
  //     e.preventDefault();
  //     if (searchAddress === "") {
  //       setRecentSearch({ text: "", type: "" });
  //       map.setCenter(currentPos);
  //       dispatch(setMarkerPos(currentPos));
  //     } else {
  // addressSearch(searchAddress);
  // setRecentSearch({ text: searchAddress, type: "주소" });
  // setSearchAddress("");
  //     }
  //   },
  //   [addressSearch, searchAddress, dispatch, currentPos, map]
  // );

  const onKeywordChange = useCallback((e) => {
    e.preventDefault();
    setSearchAddress("");
    setSearchKeyword(e.target.value);
  }, []);

  const onAddressChange = useCallback((e) => {
    e.preventDefault();
    setSearchKeyword("");
    setSearchAddress(e.target.value);
  }, []);

  const onCurrentPosBtnClick = useCallback(() => {
    setRecentSearch({ text: "", type: "" });
    map.setCenter(currentPos);
    dispatch(setMarkerPos(currentPos));
  }, [currentPos, dispatch, map]);

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <div className={styles["marker-pos"]}>
        마커 위치 : {address.address}
        {address.roadAddress && ` (${address.roadAddress})`}
        <button onClick={onCurrentPosBtnClick}>현위치로</button>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles["input--text-wrapper"]}>
          <input
            className={classNames(styles.search, styles["search--keyword"])}
            type="text"
            value={searchKeyword}
            onChange={onKeywordChange}
            placeholder="장소 검색"
          />
          <input
            className={classNames(styles.search, styles["search--address"])}
            type="text"
            value={searchAddress}
            onChange={onAddressChange}
            placeholder="주소 검색"
          />
        </div>
        <input type="submit" value="검색" />
      </form>

      {recentSearch.text !== "" && (
        <div className={styles["result"]}>
          {/* <h2 className={styles["result__header"]}>
            "{recentSearch.text}" 에 대한 {recentSearch.type} 검색 결과
          </h2> */}
          {/* {error && (
            <div className={styles["result--error"]}>
              오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {isZero ? ( */}

          {/* ) : ( */}

          {isZero ? (
            <div className={styles["result--zero"]}>검색 결과가 없습니다.</div>
          ) : (
            <ul className={styles["result__list"]}>
              {searchResult.map((el: any, i: any) => (
                <li
                  className={classNames(
                    styles["result__list__item"],
                    selected === i && styles.selected
                  )}
                  key={i}
                  onClick={() => {
                    map.setCenter(new window.kakao.maps.LatLng(el.y, el.x));
                    map.setLevel(3);
                    dispatch(
                      setMarkerPos(new window.kakao.maps.LatLng(el.y, el.x))
                    );
                    setSelected(i);
                  }}
                >
                  <div className={styles["result__place-name"]}>
                    {el.place_name}
                  </div>
                  <div className={styles["result__address"]}>
                    {el.place_name
                      ? `- 지번 주소: ${el.address_name}`
                      : `지번 주소: ${el.address_name}`}
                  </div>
                  {el.road_address_name && (
                    <div className={styles["result__road-address"]}>
                      {el.place_name
                        ? `- 도로명 주소: ${el.road_address_name}`
                        : `도로명 주소: ${el.road_address_name}`}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className={styles["resut__pagination"]}>
            <button onClick={pagination.prevClick}>prev</button>
            <span>
              {currentPage} / {Math.ceil(pagination.totalCount / 15)}
            </span>
            <button onClick={pagination.nextClick}>next</button>
          </div>
          {/* )} */}
        </div>
      )}
      <div className={styles.content}>
        하이요
        <input></input>
      </div>
    </div>
  );
};

export default NewReview;
