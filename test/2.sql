-- @InterfaceName: IAuthLog
select *
from users.user join users.auth_log using(user_id)
