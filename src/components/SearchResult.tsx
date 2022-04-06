import classNames from "classnames";
import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMarkerPos } from "../redux/modules/getMap";
import { getMapStateType, SearchResultPropType, stateType } from "../types";
import styles from "./SearchResult.module.scss";

const SearchResult: React.FC<SearchResultPropType> = ({
  selected,
  setSelected,
  place,
  i,
}): ReactElement => {
  const dispatch = useDispatch();
  const {
    data: { map },
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  
  return (
    <li
      className={classNames(
        styles["item"],
        selected.section === "place" && selected.index === i && styles.selected
      )}
      onClick={(): void => {
        map.setCenter(new window.kakao.maps.LatLng(place.y, place.x));
        map.setLevel(3);
        dispatch(setMarkerPos(new window.kakao.maps.LatLng(place.y, place.x)));
        setSelected({ section: "place", index: i });
      }}
    >
      <div className={styles["item__header"]}>
        <span className={styles["header__place-name"]}>{place.place_name}</span>
        <span className={styles["header__category"]}>
          {place.category_group_name}
        </span>
      </div>
      <div className={styles["item__address"]}>
        {place.place_name ? `- ${place.address_name}` : `${place.address_name}`}
      </div>
      {place.road_address_name && (
        <div className={styles["item__road-address"]}>
          {place.place_name
            ? `(${place.road_address_name})`
            : `(${place.road_address_name})`}
        </div>
      )}
    </li>
  );
};

export default SearchResult;
