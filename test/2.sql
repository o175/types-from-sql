-- @InterfaceName: IAuthLog
select *, u.user_id as id
from users.user u join users.auth_log al using(user_id)
