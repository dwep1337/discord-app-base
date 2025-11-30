import { Event } from "../../../core/entities/Event";
import { GuildMember } from "discord.js";

export default class GuildMemberAddEvent extends Event {
  constructor() {
    super("guildMemberAdd", false);
  }

  public async execute(member: GuildMember): Promise<void> {
    console.log(
      `👤 ${member.user.tag} entrou no servidor ${member.guild.name}`
    );
  }
}
