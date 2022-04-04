import styles from "./Search.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPos, setMarkerPos } from "../redux/modules/getMap";
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
  const [selected, setSelected] = useState<any>({ section: null, index: null });
  const listElRef = useRef<any>(null);

  // 검색 로직
  const searchCallback = useCallback(
    (result: Array<any>, status: string, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        dispatch(setFilter("HERE"));
        setError(false);
        setIsZero(false);
        setSearchResult(result);
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
            setSelected({ section: null, index: null });
            setCurrentPage((prevState: number): number => prevState + 1);
            pagination.nextPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        prevClick: (): void => {
          if (pagination.hasPrevPage) {
            setSelected({ section: null, index: null });
            setCurrentPage((prevState: number): number => prevState - 1);
            pagination.prevPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        totalCount: pagination.totalCount,
      });
    },
    [dispatch]
  );

  const search = useCallback(
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
      setSelected({ section: null, index: null });

      if (searchText === "") {
        map.setCenter(currentPos);
        dispatch(setMarkerPos(currentPos));
      } else if (searchText !== "") {
        search(searchText);
      }
    },
    [searchText, map, currentPos, dispatch, search]
  );

  const onKeywordChange = useCallback((e): void => {
    e.preventDefault();

    setSearchText(e.target.value);
  }, []);
  //////

  // 현위치 버튼 로직
  const searchAndMove = useCallback(
    (location: any): void => {
      map.setCenter(location);
      dispatch(setMarkerPos(location));
      setCurrentPage(1);
      setSelected({ section: "place", index: 0 });

      if (Object.keys(geocoder).length !== 0 && location !== null) {
        geocoder.coord2Address(
          location.getLng(),
          location.getLat(),
          (result: Array<any>, status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
              search(result[0].address.address_name);
              setSearchText(result[0].address.address_name);
            }
          }
        );
      }
    },
    [dispatch, geocoder, search, map]
  );

  const onCurrentPosBtnClick = useCallback(
    (e?): void => {
      e?.preventDefault();

      if (currentPos === null) {
        window.navigator.geolocation.getCurrentPosition(
          async (pos): Promise<void> => {
            try {
              const location = new window.kakao.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
              );
              dispatch(setCurrentPos(location));
              searchAndMove(location);
            } catch (error) {
              console.log(error);
            }
          }
        );
      } else {
        searchAndMove(currentPos);
      }
    },
    [currentPos, dispatch, searchAndMove]
  );
  ////

  // 컴포넌트가 마운트될 때 현위치로 이동 (현위치 있을 경우)
  useEffect((): void => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      onCurrentPosBtnClick();
    }
  }, [currentPos, geocoder, onCurrentPosBtnClick]);

  // 드래그 이벤트
  useEffect((): void => {
    const dragCallback = (): void => {
      const location = map.getCenter();

      geocoder.coord2Address(
        location.getLng(),
        location.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setCurrentPage(1);
            search(result[0].address.address_name);
            setSearchText(result[0].address.address_name);
            dispatch(setMarkerPos(location));
          }
        }
      );
    };

    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragend", dragCallback);
    }
  }, [dispatch, geocoder, search, map]);

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
