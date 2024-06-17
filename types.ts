import { Server, Member, Profile } from "@prisma/client"

/**
 * 用一个"members"属性扩展"Server"类型
 * 该属性是一个带有"profile"属性的"Member"对象数组，该属性为"profile"对象。
 *
 * 用于表示服务器及其成员的类型。
 */
export type ServerWithMembersWithProfiles = Server & {
	members: (Member & { profile: Profile })[]
}
