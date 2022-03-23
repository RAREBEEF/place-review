import styles from "./Search.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMarkerPos } from "../redux/modules/getMap";
import { paginationStateType, SearchPropType, stateType } from "../types";
import { Routes, Route } from "react-router-dom";
import FindReview from "./FindReview";
import NewReview from "./NewReview";
import Button from "./Button";

const Search: React.FC<SearchPropType> = ({ setIsFindTab }): ReactElement => {
  const dispatch = useDispatch();
  const { loading, data, currentPos, markerPos } = useSelector(
    (state: stateType) => state.getMap
  );

  const map = data.map;
  const places = data.places;
  const geocoder = data.geocoder;

  const [searchKeywordText, setSearchKeywordText] = useState<string | number>(
    ""
  );

  // const [recentSearch, setRecentSearch] = useState<recentSearchStateType>({
  //   text: "",
  //   type: "",
  // });

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

  const [viewAllReview, setViewAllReview] = useState<boolean>(true);

  // 검색 콜백
  const searchCallback = useCallback(
    (result: any, status: any, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setViewAllReview(false);
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
            setSelected(0);
            setCurrentPage((prevState) => prevState + 1);
            pagination.nextPage();
          }
        },
        prevClick: () => {
          if (pagination.hasPrevPage) {
            setSelected(0);
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

  // 장소 검색 submit
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setCurrentPage(1);
      setSelected(0);
      if (searchKeywordText === "") {
        map.setCenter(currentPos);
        dispatch(setMarkerPos(currentPos));
      } else if (searchKeywordText !== "") {
        keywordSearch(searchKeywordText);
      }
    },
    [searchKeywordText, map, currentPos, dispatch, keywordSearch]
  );

  const onKeywordChange = useCallback((e) => {
    e.preventDefault();
    setSearchKeywordText(e.target.value);
  }, []);

  const onCurrentPosBtnClick = useCallback(
    (e?) => {
      e?.preventDefault();
      map.setCenter(currentPos);
      dispatch(setMarkerPos(currentPos));
      setCurrentPage(1);
      setSelected(0);
      if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
        geocoder.coord2Address(
          currentPos.getLng(),
          currentPos.getLat(),
          (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              keywordSearch(result[0].address.address_name);
              setSearchKeywordText(result[0].address.address_name);
            }
          }
        );
      }
    },
    [currentPos, dispatch, geocoder, keywordSearch, map]
  );

  // 최초 위치 주소
  useEffect(() => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      onCurrentPosBtnClick();
    }
  }, [currentPos, geocoder, onCurrentPosBtnClick]);

  useEffect(() => {
    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragend", () => {
        const location = map.getCenter();

        geocoder.coord2Address(
          location.getLng(),
          location.getLat(),
          (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setCurrentPage(1);
              setSelected(0);
              keywordSearch(result[0].address.address_name);
              setSearchKeywordText(result[0].address.address_name);
              dispatch(setMarkerPos(location));
            }
          }
        );
      });
    }
  }, [dispatch, geocoder, keywordSearch, map]);

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles["input--text-wrapper"]}>
          <input
            className={classNames(styles.search, styles["search--keyword"])}
            type="text"
            value={searchKeywordText}
            onChange={onKeywordChange}
            placeholder="장소 검색"
          />
        </div>
        <Button text="검색" />
        <Button onClick={onCurrentPosBtnClick} text="현위치로" />
      </form>

      <div className={styles["result"]}>
        {error ? (
          <div className={styles["result--error"]}>
            오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : isZero ? (
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
                    ? `- ${el.address_name}`
                    : `${el.address_name}`}
                </div>
                {el.road_address_name && (
                  <div className={styles["result__road-address"]}>
                    {el.place_name
                      ? `(${el.road_address_name})`
                      : `(${el.road_address_name})`}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className={styles["resut__pagination"]}>
          <Button onClick={pagination.prevClick} text="prev" />
          <span>
            {currentPage} /{" "}
            {Math.ceil(pagination.totalCount / 15) === 0
              ? 1
              : Math.ceil(pagination.totalCount / 15)}
          </span>
          <Button onClick={pagination.nextClick} text="next" />
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <FindReview
              viewAllReview={viewAllReview}
              setViewAllReview={setViewAllReview}
              setIsFindTab={setIsFindTab}
              onCurrentPosBtnClick={onCurrentPosBtnClick}
            />
          }
        ></Route>
        <Route
          path="/new"
          element={<NewReview setIsFindTab={setIsFindTab} />}
        ></Route>
      </Routes>
    </div>
  );
};

export default Search;
