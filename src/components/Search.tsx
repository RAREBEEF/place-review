import styles from "./Search.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMarkerPos } from "../redux/modules/getMap";
import {
  getMapStateType,
  paginationStateType,
  SearchPropType,
  stateType,
} from "../types";
import { Routes, Route } from "react-router-dom";
import FindReview from "./FindReview";
import NewReview from "./NewReview";
import Button from "./Button";
import SearchResult from "./SearchResult";
import { setFilter } from "../redux/modules/getReviews";

const Search: React.FC<SearchPropType> = (): ReactElement => {
  const dispatch = useDispatch();
  const {
    loading,
    data: { map, places, geocoder },
    currentPos,
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  const [searchText, setSearchText] = useState<string | number>("");
  const [searchResult, setSearchResult] = useState<Array<any>>([]);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [pagination, setPagination] = useState<paginationStateType>({
    nextClick: () => {},
    prevClick: () => {},
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selected, setSelected] = useState<any>({ section: null, index: 0 });
  const listElRef = useRef<any>(null);

  const searchCallback = useCallback(
    (result: Array<any>, status: string, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        dispatch(setFilter("HERE"));
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
        nextClick: (): void => {
          if (pagination.hasNextPage) {
            setSelected({ section: "place", index: 0 });
            setCurrentPage((prevState: number): number => prevState + 1);
            pagination.nextPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        prevClick: (): void => {
          if (pagination.hasPrevPage) {
            setSelected({ section: "place", index: 0 });
            setCurrentPage((prevState: number): number => prevState - 1);
            pagination.prevPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        totalCount: pagination.totalCount,
      });
    },
    [dispatch, map]
  );

  const keywordSearch = useCallback(
    (keyword: string | number): void => {
      places.keywordSearch(keyword, searchCallback, {
        location: currentPos,
      });
    },
    [places, searchCallback, currentPos]
  );

  const onSubmit = useCallback(
    (e): void => {
      e.preventDefault();

      setCurrentPage(1);
      setSelected({ section: "place", index: 0 });

      if (searchText === "") {
        map.setCenter(currentPos);
        dispatch(setMarkerPos(currentPos));
      } else if (searchText !== "") {
        keywordSearch(searchText);
      }
    },
    [searchText, map, currentPos, dispatch, keywordSearch]
  );

  const onKeywordChange = useCallback((e): void => {
    e.preventDefault();

    setSearchText(e.target.value);
  }, []);

  const onCurrentPosBtnClick = useCallback(
    (e?): void => {
      e?.preventDefault();

      map.setCenter(currentPos);
      dispatch(setMarkerPos(currentPos));
      setCurrentPage(1);
      setSelected({ section: "place", index: 0 });

      if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
        geocoder.coord2Address(
          currentPos.getLng(),
          currentPos.getLat(),
          (result: Array<any>, status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
              keywordSearch(result[0].address.address_name);
              setSearchText(result[0].address.address_name);
            }
          }
        );
      }
    },
    [currentPos, dispatch, geocoder, keywordSearch, map]
  );

  useEffect((): void => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      onCurrentPosBtnClick();
    }
  }, [currentPos, geocoder, onCurrentPosBtnClick]);

  useEffect((): void => {
    const dragCallback = (): void => {
      const location = map.getCenter();

      geocoder.coord2Address(
        location.getLng(),
        location.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setCurrentPage(1);
            setSelected({ section: "place", index: 0 });
            keywordSearch(result[0].address.address_name);
            setSearchText(result[0].address.address_name);
            dispatch(setMarkerPos(location));
          }
        }
      );
    };

    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragend", dragCallback);
    }
  }, [dispatch, geocoder, keywordSearch, map]);

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={classNames(styles["input--search"])}
          type="text"
          value={searchText}
          onChange={onKeywordChange}
          placeholder="장소 검색"
        />
        <div className={styles["btn-wrapper"]}>
          <Button text="검색" className={["Search__search"]} />
          <Button
            onClick={onCurrentPosBtnClick}
            text="현위치"
            className={["Search__current-pos"]}
          />
        </div>
      </form>
      <div className={styles["result"]}>
        {error ? (
          <div className={styles["result__error"]}>
            오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : isZero ? (
          <div className={styles["result__zero"]}>검색 결과가 없습니다.</div>
        ) : (
          <ul className={styles["result__list"]} ref={listElRef}>
            {searchResult.map((el: any, i: any) => (
              <SearchResult
                key={i}
                i={i}
                selected={selected}
                setSelected={setSelected}
                place={el}
              />
            ))}
          </ul>
        )}
        <div className={styles["result__pagination"]}>
          <Button
            onClick={pagination.prevClick}
            text="prev"
            className={["Search__prev"]}
          />
          <span className={styles["pagination__count"]}>
            {currentPage} /{" "}
            {Math.ceil(pagination.totalCount / 15) === 0
              ? 1
              : Math.ceil(pagination.totalCount / 15)}
          </span>
          <Button
            onClick={pagination.nextClick}
            text="next"
            className={["Search__next"]}
          />
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <FindReview
              onCurrentPosBtnClick={onCurrentPosBtnClick}
              selected={selected}
              setSelected={setSelected}
            />
          }
        ></Route>
        <Route
          path="/new"
          element={
            <NewReview searchResult={searchResult} selected={selected} />
          }
        ></Route>
      </Routes>
    </div>
  );
};

export default Search;
