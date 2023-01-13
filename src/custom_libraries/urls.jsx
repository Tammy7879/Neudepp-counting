import globalVariables from './globalVariables';

export default class urls {

    static DEFAULT_IP = "127.0.0.1";
    static IP_ADDRESS = localStorage.getItem(globalVariables.IP_ADDRESS)

    static BASE_URL = `http://${this.IP_ADDRESS}:5000` //"http://127.0.0.1:5000"

    static WIFI_LIST = urls.BASE_URL + "/wifi_list"
    static WIFI_CONNECT = urls.BASE_URL + "/connect_wifi"

    static LOGIN = urls.BASE_URL + "/sign_in"
    static SIGNUP = urls.BASE_URL + "/sign_up"
    static TOKEN_REFRESH = urls.BASE_URL + "/token_refresh"
    static SIGNOUT = urls.BASE_URL + "/sign_out"
    static ALL_USERS = urls.BASE_URL + "/all_users"
    static ADD_USER = urls.BASE_URL + "/sign_up"
    static UPDATE_USER = urls.BASE_URL + "/update_user"
    static DELETE_USER = urls.BASE_URL + "/delete_user"

    static ALL_PRODUCT_INFO = urls.BASE_URL + "/get_all_product_info"
    static INSERT_PRODUCT_INFO = urls.BASE_URL + "/insert_product_info"
    static UPDATE_PRODUCT_INFO = urls.BASE_URL + "/update_product_info"
    static DELETE_PRODUCT_INFO = urls.BASE_URL + "/delete_product_info"

    static ALL_COMPANY_INFO = urls.BASE_URL + "/get_all_comapny_info"
    static INSERT_COMPANY_INFO = urls.BASE_URL + "/insert_company_info"
    static UPDATE_COMPANY_INFO = urls.BASE_URL + "/update_company_info"
    static DELETE_COMPANY_INFO = urls.BASE_URL + "/delete_company_info"

    static ALL_INGREDIENT_INFO = urls.BASE_URL + "/get_all_ingredient_info"
    static INSERT_INGREDIENT_INFO = urls.BASE_URL + "/insert_ingredient_info"
    static UPDATE_INGREDIENT_INFO = urls.BASE_URL + "/update_ingredient_info"
    static DELETE_INGREDIENT_INFO = urls.BASE_URL + "/delete_ingredient_info"

    static ALL_RECIPES = urls.BASE_URL + "/get_all_recipes"
    static INSERT_RECIPE = urls.BASE_URL + "/insert_recipe"
    static UPDATE_RECIPE = urls.BASE_URL + "/update_recipe"
    static DELETE_RECIPE = urls.BASE_URL + "/delete_recipe"

    static ALL_RECIPES_VIEW = urls.BASE_URL + "/get_all_recipes_view"

    static ALL_CLIENT_INFO = urls.BASE_URL + "/get_all_client_info"
    static INSERT_CLIENT_INFO = urls.BASE_URL + "/insert_client_info"
    static UPDATE_CLIENT_INFO = urls.BASE_URL + "/update_client_info"
    static DELETE_CLIENT_INFO = urls.BASE_URL + "/delete_client_info"

    static ALL_BATCHES = urls.BASE_URL + "/get_all_batches"
    static INSERT_BATCH = urls.BASE_URL + "/insert_batch"
    static UPDATE_BATCH = urls.BASE_URL + "/update_batch"
    static DELETE_BATCH = urls.BASE_URL + "/delete_batch"

    static ASSIGNED_CLIENT = urls.BASE_URL + "/get_assigned_client"
    static BATCHES_BY_CLIENT = urls.BASE_URL + "/batches_by_client"
    static ALL_OPERATORS = urls.BASE_URL + "/get_all_operators"
    static ASSIGN_BATCH = urls.BASE_URL + "/assign_batch"

    static BATCH_DETAILS = urls.BASE_URL + "/get_batch_details"
    static BATCH_COUNT = urls.BASE_URL + "/get_batch_count"
    static INSERT_BATCH_DATA = urls.BASE_URL + "/insert_batch_data"

    static BATCHES_DATA = urls.BASE_URL + "/get_batches_data"

    static DISK_SPACE = urls.BASE_URL + "/get_disk_space"

    static ALL_LABELS = urls.BASE_URL + "/get_all_label_info"
    static INSERT_LABEL = urls.BASE_URL + "/insert_label_info"
    static DELETE_LABEL = urls.BASE_URL + "/delete_label_info"
    static GET_SELECTED_LABEL = urls.BASE_URL + "/get_selected_label"
    static SELECT_LABEL = urls.BASE_URL + "/select_label"

    static UPDATE_SCALE = urls.BASE_URL + "/update_scale"
    static SET_TARE = urls.BASE_URL + "/set_tare"
    static SET_ZERO = urls.BASE_URL + "/set_zero"
    static GET_INGREDIENT = urls.BASE_URL + "/get_all_ingredient_info_info"
    static IMPORT_DATA = urls.BASE_URL +"/import_data"
}